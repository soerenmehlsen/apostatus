"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ redirectTo: "/login" })}
      className="text-muted-foreground"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Log ud</span>
    </Button>
  );
}
