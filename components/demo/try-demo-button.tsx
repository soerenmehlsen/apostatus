import { Button } from "@/components/ui/button";

// Bevidst et almindeligt <a> og IKKE next/link: vi har brug for en fuld
// sideindlæsning, så root-layoutet (og DemoBootstrap, der installerer
// fetch-interceptoren) gen-monteres med demo-cookien sat. En soft navigation
// ville genbruge det allerede-monterede layout, så interceptoren aldrig blev
// installeret, og dashboardet ville hente rigtige data.
export function TryDemoButton() {
  return (
    <Button asChild variant="outline" size="lg" className="w-full">
      <a href="/api/demo/start">Prøv demo uden login</a>
    </Button>
  );
}
