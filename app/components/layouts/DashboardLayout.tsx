import type { ReactNode } from "react";
import { Form, NavLink } from "react-router";

type DashboardLayoutProps = {
  title: string;
  activeNav?: "dashboard" | "report" | "stock" | "cameras";
  children: ReactNode;
  headerContent?: ReactNode;
  headerActions?: ReactNode;
};

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
  key: "dashboard" | "report" | "stock" | "cameras";
  disabled?: boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/home",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-10.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    key: "dashboard" as const,
  },
  {
    label: "Report",
    to: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M5 4h14a1 1 0 0 1 1 1v14l-4-3-4 3-4-3-4 3V5a1 1 0 0 1 1-1Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 9h6M9 12h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    key: "report" as const,
    disabled: true,
  },
  {
    label: "All Stock",
    to: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          ry="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M7 12h3l1.5 4 2-8 1.5 4H17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    key: "stock" as const,
    disabled: true,
  },
  {
    label: "Cameras",
    to: "/upload",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <rect
          x="3"
          y="6"
          width="18"
          height="14"
          rx="2"
          ry="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M9 6l1.5-2h3L15 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    key: "cameras" as const,
  },
];

export function DashboardLayout({
  title,
  activeNav = "dashboard",
  children,
  headerContent,
  headerActions,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-full max-w-xs flex-col gap-10 bg-red-500 px-6 py-8 text-white md:w-72">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-semibold">
            JD
          </div>
          <div>
            <p className="text-base font-semibold">John Doe</p>
            <p className="text-sm text-white/70">Store Manager</p>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">AI Stock Level Estimator</p>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const isActive = item.key === activeNav;
            const baseClasses =
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition";
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={
                  item.disabled
                    ? `${baseClasses} cursor-not-allowed opacity-60`
                    : `${baseClasses} ${
                        isActive
                          ? "bg-white/20 text-white shadow-sm"
                          : "text-white/80 hover:bg-white/10"
                      }`
                }
                aria-disabled={item.disabled}
              >
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto text-xs text-white/60">
          &copy; {new Date().getFullYear()} StockSpies
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
          <div>
            {headerContent ? (
              headerContent
            ) : (
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            {headerActions}
            <Form method="post" action="/logout">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-400 hover:text-red-500"
              >
                <span aria-hidden="true">↗</span>
                Logout
              </button>
            </Form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-10">
          <div className="mx-auto w-full max-w-7xl px-2 sm:px-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
