"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDemoState } from "@/lib/demo/store";

// Rydder klient-lageret og navigerer derefter til stop-route, som rydder
// cookien og sender tilbage til login.
export function EndDemoButton() {
  const handleEndDemo = () => {
    resetDemoState();
    window.location.href = "/api/demo/stop";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleEndDemo}
      className="text-muted-foreground"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Afslut demo</span>
    </Button>
  );
}
