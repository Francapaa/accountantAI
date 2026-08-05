import { redirectIfAuthed } from "@/lib/auth";

import { SignUpForm } from "./components";

export default async function SignUpPage() {
  await redirectIfAuthed("/home");
  return <SignUpForm />;
}