import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  href?: string;
  className?: string;
  textClassName?: string;
}

export function BrandLogo({ href = "/", className, textClassName }: BrandLogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-flex rounded-md shadow-sm">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="CloudChef logo"
          role="img"
        >
          <rect x="1" y="1" width="26" height="26" rx="7" fill="hsl(var(--primary))" />
          <rect x="2.2" y="2.2" width="23.6" height="23.6" rx="6" stroke="hsl(var(--accent))" strokeWidth="1.2" />
          <path
            d="M7.6 15C7.6 12.9 9.3 11.2 11.4 11.2H11.9C12.6 10 13.9 9.1 15.4 9.1C17.6 9.1 19.3 10.8 19.3 13C19.3 13.2 19.3 13.4 19.3 13.5C20.5 13.9 21.4 15 21.4 16.2C21.4 17.8 20.1 19.1 18.5 19.1H10.5C8.9 19.1 7.6 17.8 7.6 16.2C7.6 15.8 7.6 15.4 7.6 15Z"
            fill="hsl(var(--secondary))"
          />
          <path
            d="M14.4 10.5C14.4 9.4 15.3 8.5 16.4 8.5C17.5 8.5 18.4 9.4 18.4 10.5V11.2H14.4V10.5Z"
            fill="hsl(var(--primary-foreground))"
          />
          <rect x="13.8" y="11.2" width="5.4" height="0.9" rx="0.45" fill="hsl(var(--primary-foreground))" />
          <path
            d="M10.6 12.4C11.4 11.7 12.6 11.7 13.4 12.4C12.7 13.2 11.3 13.2 10.6 12.4Z"
            fill="hsl(var(--accent))"
          />
        </svg>
      </span>
      <span className={cn("text-lg font-semibold tracking-tight", textClassName)}>CloudChef</span>
    </Link>
  );
}
