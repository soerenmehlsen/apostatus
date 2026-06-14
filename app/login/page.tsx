import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { SignInButton } from "@/components/auth/sign-in-button";
import { TryDemoButton } from "@/components/demo/try-demo-button";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center">
      <Card className="w-full items-center gap-6 py-10 text-center">
        <div className="flex size-12 items-center justify-center">
          <Image
            src="/ApoStatusLogo.png"
            alt=""
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <div className="space-y-1 px-6">
          <h1 className="text-xl font-bold">
            Apo<span className="text-primary">Status</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Log ind med din arbejdskonto for at fortsætte.
          </p>
        </div>
        <div className="w-full space-y-3 px-6">
          <SignInButton />
          <TryDemoButton />
        </div>
      </Card>
    </div>
  );
}
