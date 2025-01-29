import { redirect } from "next/navigation";

export default function Home() {
  redirect("/home");  // Redirects the user to the /home route

  return null;  // No need to render anythindg since the redirect occurs
}