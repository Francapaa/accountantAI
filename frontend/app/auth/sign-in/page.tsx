import { redirectIfAuthed } from "@/lib/auth";

import { SignInForm } from "./components";

export default async function SignInPage() {
  await redirectIfAuthed("/home");
  return <SignInForm />;
}