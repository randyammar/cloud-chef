import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/app/recipes");
  }

  return (
    <main className="container py-12">
      <AuthForm />
    </main>
  );
}
