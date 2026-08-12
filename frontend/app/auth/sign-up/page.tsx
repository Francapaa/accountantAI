import { redirectIfAuthed } from "@/lib/auth";
import { authPageMetadata } from "../metadata";
import { SignUpForm } from "./components";

export const metadata = authPageMetadata.signUp;

export default async function SignUpPage() {
  await redirectIfAuthed("/home");
  return <SignUpForm />;
}