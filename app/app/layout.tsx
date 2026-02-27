import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AppNav userEmail={user.email} />
      <main className="container py-6 sm:py-8">{children}</main>
    </div>
  );
}
