import { authPageMetadata } from "../metadata";
import { UpdatePasswordForm } from "./components";

export const metadata = authPageMetadata.updatePassword;

export default async function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}