import Link from "next/link";
import { Button } from "@/components/ui/button";

// prefetch={false}: undgå at Next henter route-handleren (og sætter cookien)
// på forhånd, før brugeren faktisk klikker.
export function TryDemoButton() {
  return (
    <Button asChild variant="outline" size="lg" className="w-full">
      <Link href="/api/demo/start" prefetch={false}>
        Prøv demo uden login
      </Link>
    </Button>
  );
}
