"use client";

import { useState } from "react";
import { isDemoClient } from "@/lib/demo/is-demo";
import { installDemoFetch } from "@/lib/demo/interceptor";

// Installerer fetch-interceptoren synkront under render (via useState-
// initializer), så den er på plads FØR nogen børne-komponent når at kalde
// fetch i deres effekter. Renderer intet.
export function DemoBootstrap() {
  useState(() => {
    if (isDemoClient()) {
      installDemoFetch();
    }
    return null;
  });
  return null;
}
