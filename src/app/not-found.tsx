import Link from 'next/link';

/* ============================================================
   Sport Visa — 404 Not Found
   instrument-dark · lime brand · centered error composition
   ============================================================ */

export default function NotFound() {
  const links = ['ფეხბურთელთა დირექტორია', 'კლუბები', 'ჩემი პროფილი'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 font-sans text-ink-200">
      {/* Subtle pitch background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1400&q=70"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Brand glow */}
      <div className="pointer-events-none absolute -right-24 top-10 h-[460px] w-[460px] rounded-full bg-brand-400/8 blur-[150px]" />

      {/* Body — two-column on large screens */}
      <div className="relative z-10 mx-auto grid max-w-[1080px] items-center gap-10 px-5 py-16 sm:px-7 lg:grid-cols-[1fr_0.85fr] lg:py-24">
        {/* Left: text content */}
        <div className="order-2 lg:order-1">
          {/* Animated badge */}
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-brand-400/30 bg-brand-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            შეცდომა 404
          </span>

          <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.08] tracking-tight text-ink-50 sm:text-[52px]">
            გვერდი ვერ მოიძებნა
          </h1>
          <p className="mt-4 max-w-md text-[15.5px] leading-[1.7] text-ink-400">
            როგორც ჩანს, ეს ბურთი აუტში გავიდა. მისამართი არ არსებობს ან გადატანილია სხვა ადგილას.
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand-400 px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/25"
            >
              <svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5 10v10h14V10" />
                <path d="M9 20v-6h6v6" />
              </svg>
              მთავარ გვერდზე
            </Link>
            <Link
              href="/footballers"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-btn border border-ink-700 bg-ink-900 px-6 text-[15px] font-medium text-ink-100 transition-colors hover:border-ink-600 hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/25"
            >
              <svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              ფეხბურთელის ძიება
            </Link>
          </div>

          {/* Useful links */}
          <div className="mt-10 border-t border-ink-800 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
              სასარგებლო ბმულები
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map((l) => (
                <Link
                  key={l}
                  href="/"
                  className="group inline-flex items-center gap-1.5 rounded-pill border border-ink-800 bg-ink-900/60 px-3.5 py-1.5 text-[12.5px] font-medium text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-50"
                >
                  {l}
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-ink-600 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: decorative 404 display */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
            <span className="pointer-events-none absolute select-none font-display text-[200px] font-bold leading-none tracking-tighter tabular-nums text-brand-400/15 sm:text-[260px]">
              404
            </span>
            <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-brand-400/12 text-brand-300 ring-1 ring-brand-400/20 sm:h-32 sm:w-32">
              <svg
                width={56}
                height={56}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 11a5 5 0 0 0 5 5h4l5 3v-9a4 4 0 0 0-4-4H8a5 5 0 0 0-5 5Z" />
                <circle cx="7.5" cy="11" r="1.4" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
