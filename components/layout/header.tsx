import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

export async function Header() {
  const session = await auth();
  const userName = session?.user?.name ?? null;

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
          {userName && (
            <span className="hidden sm:block font-medium text-sm lg:text-base truncate max-w-32 lg:max-w-none">
              {userName}
            </span>
          )}
          {/* Avatar */}
          <div className="w-8 h-8 bg-muted-foreground/60 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-white" />
          </div>
          {userName && <SignOutButton />}
        </div>
      </div>
    </header>
  );
}
