import { redirectIfAuthed } from "@/lib/auth";

import { ForgotPasswordForm } from "./components";

export default async function ForgotPasswordPage() {
  await redirectIfAuthed("/home");
  return <ForgotPasswordForm />;
}