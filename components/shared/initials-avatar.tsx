import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

const tones = {
  orange: "bg-brand",
  green: "bg-green",
  purple: "bg-[#7453a6]",
  blue: "bg-info",
};

export function InitialsAvatar({
  name,
  tone = "green",
  size = "default",
  className,
}: {
  name: string;
  tone?: keyof typeof tones;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className} aria-hidden="true">
      <AvatarFallback
        className={cn("font-extrabold text-white", tones[tone], size === "sm" ? "text-[10px]" : "text-[11px]")}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
