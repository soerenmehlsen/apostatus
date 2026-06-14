import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { isDemoServer } from "@/lib/demo/is-demo-server";
import { EndDemoButton } from "@/components/demo/end-demo-button";

export async function Header() {
  const session = await auth();
  const demo = await isDemoServer();
  const userName = demo ? "Demo-bruger" : (session?.user?.name ?? null);
  const userImage = demo ? null : (session?.user?.image ?? null);

  return (
    <header className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <Link href="/" prefetch={true}>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
              <Image
                src="/ApoStatusLogo.png"
                alt=""
                width={35}
                height={35}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-bold">
              Apo<span className="text-primary">Status</span>
            </h1>
          </div>
        </Link>

        {/* Right section */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {/* Avatar */}
          <UserAvatar name={userName} image={userImage} />
          {demo ? <EndDemoButton /> : userName && <SignOutButton />}
        </div>
      </div>
    </header>
  );
}
