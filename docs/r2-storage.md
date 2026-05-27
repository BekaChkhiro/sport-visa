# R2 storage & media uploads

Sport Visa stores user-generated media (avatars, gallery photos, club logos,
news post images, chat attachments) in **Cloudflare R2** — an S3-compatible
object store. Uploads bypass our app server entirely: the client gets a
short-lived presigned `PUT` URL, uploads straight to R2, then asks the app to
record what landed.

Wired in T1.6. The env contract lives in
[`../.env.example`](../.env.example) and is validated at boot by
[`src/lib/env.ts`](../src/lib/env.ts).

---

## Upload flow

```
client                   app server                     R2
  │                          │                          │
  │  POST /api/uploads/      │                          │
  │  presign                 │                          │
  │  { kind, contentType,    │                          │
  │    contentLength }       │                          │
  ├─────────────────────────►│                          │
  │                          │  validate kind +         │
  │                          │  mime allowlist + size   │
  │                          │  cap                     │
  │                          │  buildObjectKey          │
  │                          │  getSignedUrl (60s)      │
  │  { uploadUrl, key,       │                          │
  │    requiredHeaders }     │                          │
  │◄─────────────────────────┤                          │
  │                                                     │
  │  PUT <uploadUrl>                                    │
  │  Content-Type: <type>                               │
  │  Content-Length: <bytes>                            │
  │  <bytes>                                            │
  ├────────────────────────────────────────────────────►│
  │                                                     │
  │  POST /api/uploads/      │                          │
  │  confirm                 │                          │
  │  { key, kind }           │                          │
  ├─────────────────────────►│                          │
  │                          │  headObject(key) — pull  │
  │                          │  real size + type from R2│
  │                          │  re-validate allowlist + │
  │                          │  size cap                │
  │                          │  db.media.create         │
  │  { id, key, url, ... }   │                          │
  │◄─────────────────────────┤                          │
```

Key properties:

- **Direct-to-R2 uploads** — bytes never traverse the app server, so payload
  size doesn't tie up Node memory or hit Railway's request body limits.
- **Signed Content-Length + Content-Type** — the presigned URL locks both
  headers, so a malicious client can't upload a 1 GB blob to a URL we issued
  for 4 MB, nor swap a PNG signature for a different mime.
- **Short TTL** — presigned URLs expire in 60 s (`PRESIGN_TTL_SECONDS` in
  [`src/lib/r2.ts`](../src/lib/r2.ts)). The client requests one immediately
  before uploading; we never persist them.
- **Re-validation on confirm** — `headObject` reads the actual object's size
  and content type from R2 before the row is inserted. Anything that
  bypassed presign (or where the client lied) gets deleted and rejected.
- **Server-owned keys** — the client never names objects. `buildObjectKey`
  generates `<kind-prefix>/<random>.<ext>`, so two users can't collide and
  enumeration over the public domain reveals nothing useful.

---

## Limits & allowlist

Constants in [`src/lib/r2.ts`](../src/lib/r2.ts):

| Constant              | Value                                                | Notes                                                                          |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| `MAX_UPLOAD_BYTES`    | 10 MiB                                               | Cap on a single object. Tune per-kind once feature work lands.                 |
| `ALLOWED_IMAGE_TYPES` | `image/jpeg`, `image/png`, `image/webp`, `image/gif` | Foundation uses images only. Chat attachments will extend this when T8 starts. |
| `PRESIGN_TTL_SECONDS` | 60                                                   | Short enough that a leaked URL is near-useless.                                |

Both routes enforce the allowlist and size cap. The confirm route additionally
deletes the object from R2 when it fails re-validation, so failed uploads
don't leak storage.

---

## Object keys

Pattern: `<prefix>/<32-hex-id>.<ext>`

| `MediaKind`       | Prefix         |
| ----------------- | -------------- |
| `AVATAR`          | `avatar/`      |
| `GALLERY`         | `gallery/`     |
| `CLUB_LOGO`       | `club-logo/`   |
| `CLUB_BANNER`     | `club-banner/` |
| `POST_IMAGE`      | `post/`        |
| `CHAT_ATTACHMENT` | `chat/`        |
| `OTHER`           | `misc/`        |

Prefixes give us cheap lifecycle policies later (e.g. expire `chat/` after 90
days). The ID is `crypto.randomUUID()` with hyphens stripped — 122-bit entropy,
collision risk negligible.

---

## One-time setup

### 1. Create R2 buckets

Cloudflare dashboard → R2 → "Create bucket". One per environment:

- `sport-visa-dev` — local + preview
- `sport-visa-prod` — production

### 2. Issue API token

Cloudflare dashboard → R2 → "Manage R2 API Tokens" → "Create API token":

- **Permissions**: Object Read & Write
- **Specify bucket**: scope to the bucket above (never use account-wide)
- Copy the **Access Key ID** and **Secret Access Key** into Railway / `.env.local`

### 3. Configure CORS

Bucket → Settings → CORS Policy → paste:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://sport-visa-production.up.railway.app"
    ],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Add every origin the app may run from (Railway production, Vercel previews,
custom domains). Without the production origin in the allowlist, the
browser's `PUT` to R2 will fail with a CORS preflight error.

> **Note**: `src/lib/r2.ts` sets `requestChecksumCalculation: 'WHEN_REQUIRED'`
> on the S3Client to disable the AWS SDK v3.731+ default that bakes
> `x-amz-checksum-crc32` / `x-amz-sdk-checksum-algorithm` into the presigned
> URL's signed headers. Keep that setting — otherwise the CORS allowlist
> above also has to enumerate those vendor headers and any future ones the
> SDK chooses to add.

### 4. Public read URL

Two options for `R2_PUBLIC_BASE_URL`:

- **Custom domain (production)**: bucket → Settings → Custom Domains → add
  e.g. `media.sport-visa.com`. Cloudflare provisions a cert. Set
  `R2_PUBLIC_BASE_URL=https://media.sport-visa.com`.
- **Public `r2.dev` (dev/preview)**: bucket → Settings → Public Access →
  enable `r2.dev`. Set `R2_PUBLIC_BASE_URL` to the URL Cloudflare gives you.

R2's `r2.dev` domain is rate-limited and unsuitable for production traffic.

---

## Env vars

```env
R2_ACCOUNT_ID=        # Cloudflare account ID (32-char hex)
R2_ACCESS_KEY_ID=     # API token Access Key ID
R2_SECRET_ACCESS_KEY= # API token Secret Access Key
R2_BUCKET=            # bucket name, e.g. sport-visa-dev
R2_PUBLIC_BASE_URL=   # public base URL (no trailing slash)
```

All five are optional at boot — the app keeps running before R2 is wired up —
but any call into `src/lib/r2.ts` will throw `INTERNAL` until they're set.

---

## Local development

There is no R2 emulator. For local work either:

1. Point `R2_*` at a real `sport-visa-dev` bucket (preferred — exercises the
   real CORS / signing path).
2. Skip media features locally. Code paths that don't touch uploads keep
   working because env validation is lenient (see above).

---

## Future work (not in T1.6)

- **Image post-processing**: resize avatars/logos server-side after confirm
  (or use Cloudflare Images). Tracked in T4.2 / T5.2.
- **Lifecycle policies**: expire `chat/` objects after 90 days; clean up
  orphaned `Media` rows whose owning entity got deleted.
- **Auth scoping**: presign currently doesn't check who's asking. Once T3
  lands, restrict presign to authenticated users and tie `Media` rows to a
  `uploadedById`.
- **Antivirus / NSFW scanning**: hook the confirm step into a moderation
  queue before exposing the public URL.
