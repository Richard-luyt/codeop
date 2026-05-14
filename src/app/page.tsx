import SignIn from "../components/sign-in";
import Link from "next/link";

function LogoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 28 28"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <circle cx="14" cy="14" r="13" fill="var(--brand)" />
      {/* ">" at bottom-left of circle */}
      <path
        d="M3 10 L11 18 L3 26"
        stroke="black"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1 group">
      <LogoIcon />
      <span
        className="text-xl font-black tracking-wide text-white group-hover:text-brand transition-colors"
        style={{
          fontFamily:
            "SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
          letterSpacing: "-0.04em",
        }}
      >
        CodeOP
      </span>
    </Link>
  );
}

function NavLinks() {
  return (
    <div
      className="flex items-center gap-8"
      style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
    >
      <Link
        href="/docs"
        className="text-brandgrey hover:text-brand transition-colors font-normal"
        style={{ fontSize: "1.05rem" }}
      >
        Docs
      </Link>
      <Link
        href="/demos"
        className="text-brandgrey hover:text-brand transition-colors font-normal"
        style={{ fontSize: "1.05rem" }}
      >
        Demos
      </Link>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 border-b border-white/15 backdrop-blur">
      <div className="w-full max-w-7xl mx-auto px-8 md:px-12 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-8">
          <NavLinks />
          <SignIn />
        </div>
      </div>
    </nav>
  );
}

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-[#000000] text-white">
      <NavBar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-gradient-field" />
          <div className="hero-gradient-field hero-gradient-field-alt" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 md:px-12 pt-18 pb-20">
          <div className="max-w-3xl">
            <p
              className="inline-flex items-center rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm text-brand"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              Real-time collaborative coding workspace
            </p>
            <h1
              className="mt-6 text-5xl md:text-6xl font-black leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              Review, edit, and merge code together in one place.
            </h1>
            <p
              className="mt-6 text-lg md:text-xl text-zinc-300 max-w-2xl"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              CodeOP lets your team open a file, collaborate live, and sync back
              to GitHub when the session ends. No copy-paste, no drift.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <SignIn />
              <Link
                href="/docs"
                className="inline-flex h-[37px] min-w-[120px] items-center justify-center rounded-lg border border-zinc-600 bg-zinc-900 px-[14px] text-zinc-100 hover:border-brand hover:text-brand transition-colors"
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                View Docs
              </Link>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Live Collaboration",
                desc: "Multiple users edit the same file with low-latency Yjs sync.",
              },
              {
                title: "Private Rooms",
                desc: "Create password-protected rooms for focused pair or team sessions.",
              },
              {
                title: "Auto GitHub Sync",
                desc: "When everyone leaves, merged content writes back to the repo.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5"
              >
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-sm text-zinc-300 leading-relaxed"
                  style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-16">
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
          >
            Simple workflow, fast team output
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "Sign in with GitHub and pick a repository.",
              "Open a file, create or join a collaboration room.",
              "Edit together and let CodeOP sync changes back.",
            ].map((step, idx) => (
              <div
                key={step}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="text-brand text-sm font-semibold">
                  Step {idx + 1}
                </div>
                <p
                  className="mt-2 text-zinc-200"
                  style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-16">
          <div className="rounded-2xl border border-brand/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 md:p-10">
            <h3
              className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              Start collaborating in minutes.
            </h3>
            <p
              className="mt-3 text-zinc-300 max-w-2xl"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              Connect your GitHub account, enter your workspace, and run your
              first real-time review session.
            </p>
            <div className="mt-6">
              <SignIn />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
