import type { Route } from "./+types/logout";
import { redirect } from "react-router";
import { destroyAuthToken } from "../utils/auth.server";

export async function action({}: Route.ActionArgs) {
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroyAuthToken(),
    },
  });
}

export default function LogoutRoute() {
  return null;
}
