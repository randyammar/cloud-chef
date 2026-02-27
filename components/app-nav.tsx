"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const items = [
  { href: "/app/recipes", label: "Recipes" },
  { href: "/app/favorites", label: "Favorites" },
  { href: "/app/recipes/new", label: "New Recipe" },
  { href: "/app/settings", label: "Settings" }
];

interface AppNavProps {
  userEmail?: string;
}

export function AppNav({ userEmail }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = pathname ?? "/app/recipes";

  async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <BrandLogo href="/app/recipes" textClassName="text-base" />
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <Button key={item.href} asChild variant={currentPath === item.href ? "secondary" : "ghost"} size="sm">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <p className="text-xs text-muted-foreground">{userEmail}</p>
          <Button onClick={signOut} size="sm" variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button size="icon" variant="outline" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-2">
              {items.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={currentPath === item.href ? "secondary" : "ghost"}
                  className="justify-start"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
              <Button onClick={signOut} variant="outline" className="mt-3 justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
