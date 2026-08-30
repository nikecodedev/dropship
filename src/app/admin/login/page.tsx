import { redirect } from "next/navigation";
import LoginForm from "../login-form";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin");
  return <LoginForm />;
}
