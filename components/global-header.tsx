"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export function GlobalHeader() {
  const pathname = usePathname();

  if (!pathname || pathname.startsWith("/app")) {
    return null;
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <BrandLogo href="/" />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
