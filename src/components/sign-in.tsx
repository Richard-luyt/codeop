"use client";

import type { ReactNode } from "react";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";

type SignInProps = {
  className?: string;
  children?: ReactNode;
  showIcon?: boolean;
};

export default function SignIn({
  className,
  children,
  showIcon = true,
}: SignInProps) {
  return (
    <button
      onClick={() => signIn("github", { redirectTo: "/dashboard" })}
      className={[
        "inline-flex h-10 min-w-[148px] items-center justify-center gap-2 rounded-md border border-zinc-800 px-4",
        "bg-zinc-50 text-zinc-950 text-sm font-medium transition-colors hover:bg-zinc-200",
        "active:scale-[0.98]",
        className ?? "",
      ].join(" ")}
    >
      {showIcon ? <Github size={14} strokeWidth={1.8} aria-hidden /> : null}
      {children ?? "Sign in with GitHub"}
    </button>
  );
}
