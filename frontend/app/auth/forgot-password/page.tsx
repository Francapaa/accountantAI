import { redirectIfAuthed } from "@/lib/auth";
import { authPageMetadata } from "../metadata";
import { ForgotPasswordForm } from "./components";

export const metadata = authPageMetadata.forgotPassword;

export default async function ForgotPasswordPage() {
  await redirectIfAuthed("/home");
  return <ForgotPasswordForm />;
}