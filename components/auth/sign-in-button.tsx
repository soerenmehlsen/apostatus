"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => signIn("microsoft-entra-id", { redirectTo: "/dashboard" })}
    >
      Log ind med Microsoft
    </Button>
  );
}
