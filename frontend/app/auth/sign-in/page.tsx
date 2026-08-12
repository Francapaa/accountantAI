import { redirectIfAuthed } from "@/lib/auth";
import { authPageMetadata } from "../metadata";
import { SignInForm } from "./components";

export const metadata = authPageMetadata.signIn;

export default async function SignInPage() {
  await redirectIfAuthed("/home");
  return <SignInForm />;
}