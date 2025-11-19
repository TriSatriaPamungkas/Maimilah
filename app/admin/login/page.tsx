// app/admin/login/page.tsx
import { LoginForm } from "@/src/components/molecules/loginForm";

export default function AdminLoginPage() {
  // HAPUS server-side session check
  // Biarkan client-side (LoginForm) yang handle redirect
  // Ini mencegah double redirect dan race condition

  return <LoginForm />;
}
