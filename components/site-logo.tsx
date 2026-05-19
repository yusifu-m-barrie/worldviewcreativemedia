import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  href?: string;
  /** White pill behind logo — for purple/dark backgrounds */
  onDark?: boolean;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function SiteLogo({
  href = "/",
  onDark = false,
  width = 240,
  height = 72,
  className,
  imageClassName,
  priority = false,
}: SiteLogoProps) {
  const image = (
    <Image
      src={siteConfig.logo}
      alt={siteConfig.name}
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "h-10 w-auto object-contain sm:h-11 lg:h-12",
        imageClassName
      )}
    />
  );

  const content = onDark ? (
    <span className="inline-block rounded-lg bg-white px-2.5 py-1.5 shadow-md ring-1 ring-black/5">
      {image}
    </span>
  ) : (
    image
  );

  if (!href) {
    return <span className={cn("inline-block shrink-0", className)}>{content}</span>;
  }

  return (
    <Link href={href} className={cn("inline-block shrink-0", className)}>
      {content}
    </Link>
  );
}
