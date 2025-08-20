import { User } from "lucide-react";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
         {/* Logo */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
            <Image
              src="/ApoStatus_Logo.png"
              alt=""
              width={35}
              height={35}
              className="w-full h-full object-contain"
            />
          </div>
          {/* Title */}
          <h1 className="text-lg sm:text-xl font-bold">
            Apo<span className="text-primary">Status</span>
          </h1>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {/* Pharmacy name */}
          <span className="hidden sm:block font-bold text-sm lg:text-base truncate max-w-32 lg:max-w-none">
            Mega Syd Apotek
          </span>
          {/* Avatar */}
          <div className="w-8 h-8 bg-muted-foreground/60 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-muted-foreground/80 transition-colors">
            <User size={16} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
