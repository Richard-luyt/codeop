"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <button
      onClick={() => signIn("github", { redirectTo: "/dashboard" })}
      className="flex items-center justify-center rounded-lg bg-brand text-black font-bold hover:bg-brandover hover:text-grey transition-all active:scale-95"
      style={{
        paddingLeft: "14px",
        paddingRight: "14px",
        height: "37px",
        minWidth: "120px",
        fontFamily: "var(--font-glacial), sans-serif",
      }}
    >
      Start Deploy
    </button>
  );
}
