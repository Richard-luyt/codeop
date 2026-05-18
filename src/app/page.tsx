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
      <circle cx="14" cy="14" r="13" fill="#fafafa" />
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
        className="text-xl font-black text-zinc-50 transition-colors group-hover:text-zinc-300"
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
    <div className="flex items-center gap-7">
      <Link
        href="/docs"
        className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors"
      >
        Docs
      </Link>
      <Link
        href="/demos"
        className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors"
      >
        Demos
      </Link>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="absolute inset-x-0 top-0 z-20">
      <div className="w-full max-w-7xl mx-auto px-8 md:px-12 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-8">
          <NavLinks />
          <SignIn
            className="h-9 min-w-0 !bg-zinc-900/55 !border-zinc-700/80 !text-zinc-200 hover:!bg-zinc-800/80 hover:!text-zinc-50 px-3.5 text-xs backdrop-blur-sm"
            showIcon={false}
          >
            Sign In
          </SignIn>
        </div>
      </div>
    </nav>
  );
}

export default async function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-zinc-50">
      <div className="landing-grid-bg" aria-hidden />
      <div className="landing-ambient" aria-hidden />
      <NavBar />

      <section className="relative">
        <div className="relative max-w-7xl mx-auto px-8 md:px-12 pt-28 pb-18">
          <div className="max-w-4xl">
            <p className="inline-flex items-center rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-0.5 text-[11px] font-mono tracking-widest uppercase text-zinc-500">
              Real-time collaborative coding workspace
            </p>
            <h1
              className="mt-7 text-6xl md:text-7xl font-extrabold leading-[0.97] tracking-[-0.04em] text-zinc-50"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              Review, edit, and merge code together in one place.
            </h1>
            <p
              className="mt-6 text-lg text-zinc-400 max-w-2xl"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              CodeOP lets your team open a file, collaborate live, and sync back
              to GitHub when the session ends. No copy-paste, no drift.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <SignIn />
              <Link
                href="/docs"
                className="inline-flex h-10 min-w-[132px] items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900/50 hover:text-zinc-100"
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
                className="landing-card rounded-xl border border-white/5 bg-zinc-950/40 p-5"
              >
                <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900/70">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-50">
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
                className="landing-card rounded-xl border border-zinc-900 bg-zinc-950/40 p-5"
              >
                <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                  Step {idx + 1}
                </div>
                <p className="mt-2 text-zinc-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900/70">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-16">
          <div className="rounded-xl border border-white/5 bg-zinc-950/50 p-8 md:p-10">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-50">
              Start collaborating in minutes.
            </h3>
            <p className="mt-3 max-w-2xl text-zinc-400">
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
