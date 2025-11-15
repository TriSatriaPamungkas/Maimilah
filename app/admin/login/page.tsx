// app/admin/login/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LoginForm } from "@/src/components/molecules/loginForm";

export default async function AdminLoginPage() {
  // Check jika sudah login, redirect ke dashboard
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}
