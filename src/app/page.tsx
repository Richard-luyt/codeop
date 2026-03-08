import SignIn from "../components/sign-in";
import Link from "next/link";

function LogoIcon() {
  return (
    <svg
      width="28"
      height="28"
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
    <Link href="/" className="flex items-center gap-2 group">
      <LogoIcon />
      <span
        className="text-4xl font-black tracking-wide text-white group-hover:text-brand transition-colors"
        style={{ fontFamily: "var(--font-brick-sans), sans-serif", letterSpacing: "0.05em" }}
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
      style={{ fontFamily: "var(--font-glacial), sans-serif" }}
    >
      <Link
        href="/docs"
        className="text-brandgrey hover:text-brand transition-colors font-normal"
        style={{ fontSize: "1.2rem" }}
      >
        docs
      </Link>
      <Link
        href="/demos"
        className="text-brandgrey hover:text-brand transition-colors font-normal"
        style={{ fontSize: "1.2rem" }}
      >
        demos
      </Link>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-black border-b border-white/20">
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
    <main className="min-h-screen bg-[#000000]">
      <NavBar />
    </main>
  );
}
