import type { Route } from "./+types/_index";
import { redirect } from "react-router";

export function loader({}: Route.LoaderArgs) {
  return redirect("/login");
}

export default function IndexRedirect() {
  return null;
}
