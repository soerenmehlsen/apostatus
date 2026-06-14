"use client";

import { useState } from "react";
import { User } from "lucide-react";

/** Build up to two initials from a display name (e.g. "Søren Mehlsen" -> "SM"). */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Pick a stable background colour from the name so each user keeps the same avatar. */
const AVATAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-600",
  "bg-teal-600",
  "bg-sky-600",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-pink-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface UserAvatarProps {
  name: string | null;
  /** Entra ID profile photo as a base64 data URL, when available. */
  image?: string | null;
}

export function UserAvatar({ name, image }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image) && !imageFailed;

  const initials = name ? getInitials(name) : "";
  const background = name ? getAvatarColor(name) : "bg-muted-foreground/60";

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
        showImage ? "" : background
      }`}
      title={name ?? undefined}
    >
      {showImage ? (
        // Entra returns a base64 data URL, so the Next.js image optimizer adds
        // no value here — a plain <img> avoids round-tripping it through /_next.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image!}
          alt={name ?? ""}
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : initials ? (
        <span className="text-xs font-semibold text-white select-none">
          {initials}
        </span>
      ) : (
        <User size={16} className="text-white" />
      )}
    </div>
  );
}
