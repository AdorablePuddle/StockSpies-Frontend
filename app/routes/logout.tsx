import type { Route } from "./+types/logout";
import { redirect } from "react-router";

export async function action({}: Route.ActionArgs) {
  // Placeholder for future auth clearing logic
  return redirect("/login");
}

export default function LogoutRoute() {
  return null;
}
