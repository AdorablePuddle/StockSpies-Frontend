import { useEffect } from "react";
import type { Route } from "./+types/login";
import { Form, redirect, useActionData } from "react-router";
import { commitAuthToken, extractAuthToken } from "../utils/auth.server";
import { createIcons, icons } from "lucide";

type ActionData = {
  error: string;
  values: {
    username: string;
    password: string;
  };
};

export const meta = () => [
  { title: "StockSpies | Sign in" },
  {
    name: "description",
    content: "Authenticate with the StockSpies dashboard using the admin credentials.",
  },
];

export async function action({ request }: Route.ActionArgs) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // deth crimson deth
  if (backendUrl === undefined){
    if (username === "admin" && password === "admin") {
      const cookie = await commitAuthToken("dev-login");
      return redirect("/home", {
        headers: {
          "Set-Cookie": cookie,
        },
      });
    }
  } else {
    const resp = await fetch(`${backendUrl.replace(/\/$/, "")}/login/`, {
      method: "POST",
      body: formData
    });
    if (resp.ok) {
      const payload = await resp.json();
      const token = extractAuthToken(payload) ?? "authenticated";
      return redirect("/home", {
        headers: {
          "Set-Cookie": await commitAuthToken(token),
        },
      });
    }
  }

  return Response.json(
    {
      error: "Invalid credentials.",
      values: {
        username,
        password,
      },
    },
    { status: 401 }
  );
}

export default function LoginRoute() {
  const actionData = useActionData<ActionData>();

  const usernameDefault = actionData?.values?.username ?? "";
  const passwordDefault = actionData?.values?.password ?? "";

  useEffect(() => {
    createIcons({ icons });
  });

  return (
    <main className="flex min-h-screen flex-col bg-white text-gray-900 md:flex-row">
      <section className="relative flex h-72 w-full flex-shrink-0 items-end overflow-hidden bg-slate-900 md:h-auto md:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
          alt="Fresh produce in grocery bins"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="relative z-10 w-full px-8 pb-8 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">
            StockSpies
          </p>
          <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
            AI Stock Level Estimator
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/80 md:text-base">
            Revolutionizing inventory management with computer vision.
          </p>
        </div>
      </section>

      <section className="flex w-full flex-1 items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3 text-center">
            <img
              src="/stockspies-logo.png"
              alt="StockSpies logo"
              className="mx-auto w-auto"
              loading="lazy"
              style={{ height: "5.6rem" }}
            />
            <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
          </div>

          <Form method="post" replace className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Enter email or user name
              </label>
              <input
                key={`username-${usernameDefault}`}
                id="username"
                name="username"
                type="text"
                defaultValue={usernameDefault}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="text-xs font-semibold text-red-500 transition hover:text-red-600"
                >
                  Forgot password?
                </button>
              </div>
              <input
                key={`password-${passwordDefault}`}
                id="password"
                name="password"
                type="password"
                defaultValue={passwordDefault}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            {actionData?.error ? (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {actionData.error}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Login
            </button>

            <div className="space-y-4 text-center text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-gray-200" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  aria-label="Sign in with Facebook"
                  className="inline-flex h-12 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg text-blue-500 transition hover:border-red-200 hover:text-blue-600"
                >
                  <i aria-hidden="true" className="h-5 w-5" data-lucide="facebook" />
                </button>
                <button
                  type="button"
                  aria-label="Sign in with GitHub"
                  className="inline-flex h-12 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg text-gray-700 transition hover:border-red-200 hover:text-gray-900"
                >
                  <i aria-hidden="true" className="h-5 w-5" data-lucide="github" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg text-red-500 transition hover:border-red-200 hover:text-red-600"
                >
                  G
                </button>
              </div>
            </div>
          </Form>
        </div>
      </section>
    </main>
  );
}
