import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { MediaKind } from '@prisma/client';

import { ApiError } from './api-error';
import { env } from './env';

// Upload limits / allowlist. Centralised here so the presign route, the
// confirm route, and any future direct-server uploads agree on the rules.
// Tweak per-kind as features land (e.g. chat attachments may want PDFs).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const satisfies readonly string[];

// Presigned PUT URLs expire short — the client should request a URL right
// before uploading. Long-lived URLs are a footgun if logged or cached.
export const PRESIGN_TTL_SECONDS = 60;

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

function getR2Config(): R2Config {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL } =
    env;
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET ||
    !R2_PUBLIC_BASE_URL
  ) {
    throw new ApiError(
      'INTERNAL',
      'R2 storage is not configured — set R2_* env vars (see docs/r2-storage.md)',
    );
  }
  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    publicBaseUrl: R2_PUBLIC_BASE_URL,
  };
}

let cachedClient: S3Client | undefined;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  const cfg = getR2Config();
  cachedClient = new S3Client({
    // R2 ignores region but the SDK requires one. "auto" is Cloudflare's docs default.
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    // Disable the SDK's default CRC32 integrity-protection middleware (added in
    // @aws-sdk/client-s3 v3.731+). It bakes `x-amz-checksum-crc32` and
    // `x-amz-sdk-checksum-algorithm` into the presigned URL's signed headers,
    // which the browser must then send on the direct PUT. R2's CORS allowlist
    // would have to enumerate those vendor headers — and any future ones the
    // SDK adds — for browser uploads to work. Setting WHEN_REQUIRED keeps the
    // signed headers limited to Content-Type / Content-Length, which is all
    // R2 needs and all the CORS policy documents.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  return cachedClient;
}

const KIND_TO_PREFIX: Record<MediaKind, string> = {
  AVATAR: 'avatar',
  GALLERY: 'gallery',
  CLUB_LOGO: 'club-logo',
  CLUB_BANNER: 'club-banner',
  POST_IMAGE: 'post',
  CHAT_ATTACHMENT: 'chat',
  OTHER: 'misc',
};

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Build a bucket-relative object key: `<prefix>/<random>.<ext>`. The random
 * segment is a 24-char base64url string from crypto.randomUUID — collisions
 * with 2^96 entropy aren't a practical concern.
 */
export function buildObjectKey(kind: MediaKind, contentType: string): string {
  const prefix = KIND_TO_PREFIX[kind];
  const ext = EXT_BY_MIME[contentType] ?? 'bin';
  const id = crypto.randomUUID().replace(/-/g, '');
  return `${prefix}/${id}.${ext}`;
}

export type PresignedPutResult = {
  key: string;
  uploadUrl: string;
  expiresInSeconds: number;
  requiredHeaders: Record<string, string>;
};

/**
 * Generate a presigned PUT URL the client uses to upload directly to R2.
 * The signature locks the Content-Type and Content-Length so the client
 * cannot upload a payload that doesn't match what the server validated.
 */
export async function createPresignedPutUrl(args: {
  kind: MediaKind;
  contentType: string;
  contentLength: number;
}): Promise<PresignedPutResult> {
  const { kind, contentType, contentLength } = args;
  const cfg = getR2Config();
  const key = buildObjectKey(kind, contentType);

  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  const uploadUrl = await getSignedUrl(getClient(), command, {
    expiresIn: PRESIGN_TTL_SECONDS,
    // Sign the Content-Length header — the SDK does this by default for PutObject,
    // but listing it explicitly here keeps the contract obvious.
    signableHeaders: new Set(['content-type', 'content-length']),
  });

  return {
    key,
    uploadUrl,
    expiresInSeconds: PRESIGN_TTL_SECONDS,
    requiredHeaders: {
      'Content-Type': contentType,
      'Content-Length': String(contentLength),
    },
  };
}

/** Return the public read URL for a stored key. */
export function publicUrlForKey(key: string): string {
  const cfg = getR2Config();
  return `${cfg.publicBaseUrl}/${key}`;
}

/**
 * Look up an object's actual size + content type in R2. Used by the confirm
 * endpoint to verify the client uploaded what they declared.
 */
export async function headObject(
  key: string,
): Promise<{ contentLength: number; contentType: string } | null> {
  const cfg = getR2Config();
  try {
    const res = await getClient().send(new HeadObjectCommand({ Bucket: cfg.bucket, Key: key }));
    return {
      contentLength: Number(res.ContentLength ?? 0),
      contentType: res.ContentType ?? 'application/octet-stream',
    };
  } catch (err) {
    // The SDK throws a NotFound-shaped error when the object doesn't exist.
    if (
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name: string }).name === 'NotFound'
    ) {
      return null;
    }
    throw err;
  }
}

/** Delete an object. No-op (returns) if R2 reports it doesn't exist. */
export async function deleteObject(key: string): Promise<void> {
  const cfg = getR2Config();
  await getClient().send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
}

export function isAllowedImageType(contentType: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(contentType);
}
