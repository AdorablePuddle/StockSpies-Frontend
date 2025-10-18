import type { Route } from "./+types/home";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { useInventory } from "../context/inventory";
import type { Detection } from "../types/inventory";
import { requireAuth } from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  return null;
}

const FAVORITES = [
  { label: "Strawberries", emoji: "🍓" },
  { label: "Potatoes", emoji: "🥔" },
  { label: "Bananas", emoji: "🍌" },
];

const MEDIUM_THRESHOLD = 35;
const HIGH_THRESHOLD = 75;
const OVERSTOCK_THRESHOLD = 100;

const ICON_BUTTON_CLASS =
  "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-red-400 hover:text-red-500";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "StockSpies | Dashboard" },
    {
      name: "description",
      content: "Monitor inventory levels and alerts captured by StockSpies cameras.",
    },
  ];
}

function getDetectionLookup(detections: Detection[]) {
  const lookup = new Map<string, Detection>();
  detections.forEach((item) => {
    const key = item.label.toLowerCase();
    if (!lookup.has(key)) {
      lookup.set(key, item);
    }
  });
  return lookup;
}

function classifyPercentLevel(percent: number): "low" | "medium" | "high" | "overstock" {
  if (percent > OVERSTOCK_THRESHOLD) return "overstock";
  if (percent >= HIGH_THRESHOLD) return "high";
  if (percent >= MEDIUM_THRESHOLD) return "medium";
  return "low";
}

function buildNotifications(detections: Detection[]) {
  return detections
    .filter((item) => {
      if (typeof item.quantity === "number") {
        return item.quantity < 10;
      }
      if (typeof item.stockPercentage === "number") {
        return item.stockPercentage < 35;
      }
      return false;
    })
    .map((item) => ({
      label: item.label,
      message: `${item.label} stock is low`,
      timestamp: item.timestamp,
    }));
}

export default function Home() {
  const {
    snapshot: { detections, batchTimestamp },
  } = useInventory();

  const detectionLookup = getDetectionLookup(detections);
  const notifications = buildNotifications(detections);

  const primaryValues = detections
    .map((item) =>
      typeof item.stockPercentage === "number"
        ? item.stockPercentage
        : typeof item.quantity === "number"
          ? item.quantity
          : null
    )
    .filter((value): value is number => value !== null && !Number.isNaN(value));

  const maxValue = primaryValues.length ? Math.max(...primaryValues) : 0;
  const referenceValue = Math.max(maxValue, OVERSTOCK_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD, 1);

  const axisLines = [
    { label: "High", normalized: Math.min(1, 100 / referenceValue) },
    { label: "Medium", normalized: Math.min(1, 50 / referenceValue) },
    { label: "Low", normalized: 0 },
  ];

  const headerContent = (
    <div className="flex items-center gap-4">
      <img src="/stockspies-logo.png" alt="StockSpies" className="h-12 w-auto rounded-xl bg-white p-2 shadow-sm" />
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-slate-400">
          StockSpies
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      </div>
    </div>
  );

  const headerActions = (
    <div className="flex items-center gap-3 text-slate-500">
      <button
        type="button"
        className={ICON_BUTTON_CLASS}
        aria-label="Open settings"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        type="button"
        className={`${ICON_BUTTON_CLASS} relative`}
        aria-label="View notifications"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path
            d="M6 9a6 6 0 1 1 12 0c0 6 3 7 3 7H3s3-1 3-7Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {notifications.length}
          </span>
        )}
      </button>
      <button
        type="button"
        className={ICON_BUTTON_CLASS}
        aria-label="Open profile"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 21a8 8 0 1 1 16 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );

  return (
    <DashboardLayout
      title="Dashboard"
      activeNav="dashboard"
      headerContent={headerContent}
      headerActions={headerActions}
    >
      <div className="space-y-10">
        <section className="grid gap-6 xl:grid-cols-3">
          {FAVORITES.map((item) => {
            const detection = detectionLookup.get(item.label.toLowerCase());
            const hasQuantity = typeof detection?.quantity === "number";
            const displayValue = hasQuantity
              ? `${detection!.quantity} Units`
              : typeof detection?.stockPercentage === "number"
                ? `${detection.stockPercentage}%`
                : "Awaiting data";

            return (
              <div
                key={item.label}
                className="rounded-3xl bg-gradient-to-br from-red-500 to-red-600 px-6 py-5 text-white shadow-lg"
              >
                <div className="flex items-center justify-between text-sm uppercase tracking-wide text-white/80">
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-2xl">
                    {item.emoji}
                  </span>
                </div>
                <p className="mt-6 text-3xl font-semibold">{displayValue}</p>
                {hasQuantity && typeof detection?.stockPercentage === "number" ? (
                  <p className="text-sm text-white/80">{detection.stockPercentage}% stock</p>
                ) : null}
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1.2fr] xl:grid-cols-[2.2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Stock Levels</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Latest upload
              </div>
            </div>
            <div className="mt-6 rounded-3xl bg-slate-50/90 px-6 py-8">
              <div className="grid grid-cols-[4rem,1fr] gap-4">
                <div className="relative h-48">
                  {axisLines.map((line) => (
                    <span
                      key={line.label}
                      className="absolute left-0 text-sm font-semibold text-slate-400"
                      style={{ bottom: `${line.normalized * 100}%`, transform: "translateY(50%)" }}
                    >
                      {line.label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-6">
                  <div className="relative flex h-48 items-end gap-4">
                    <div className="pointer-events-none absolute inset-0">
                      {axisLines.map((line) => (
                        <span
                          key={line.label}
                          className="absolute left-0 right-0 h-px w-full rounded-full bg-slate-200/70"
                          style={{ bottom: `${line.normalized * 100}%` }}
                        />
                      ))}
                    </div>
                    {detections.length === 0 ? (
                      <p className="relative z-10 text-sm text-slate-400">
                        Upload a snapshot to view stock levels.
                      </p>
                    ) : (
                      detections.map((item, index) => {
                        const rawValue =
                          typeof item.stockPercentage === "number"
                            ? item.stockPercentage
                            : typeof item.quantity === "number"
                              ? item.quantity
                              : 0;
                        const normalizedValue = referenceValue ? rawValue / referenceValue : 0;
                        const percentValue =
                          typeof item.stockPercentage === "number"
                            ? Math.round(item.stockPercentage)
                            : Math.round(normalizedValue * 100);
                        const level = classifyPercentLevel(percentValue);
                        const heightPercent = Math.max(0.12, Math.min(1, normalizedValue)) * 100;
                        const title = `${item.label} - ${percentValue}%${
                          typeof item.quantity === "number" ? ` (${item.quantity} units)` : ""
                        }`;
                        const barColor =
                          level === "overstock"
                            ? "from-sky-500 to-sky-400"
                            : level === "high"
                              ? "from-emerald-500 to-emerald-400"
                              : level === "medium"
                                ? "from-amber-500 to-amber-400"
                                : "from-red-500 to-red-400";

                        const flexBasis = `${100 / Math.max(1, detections.length)}%`;

                        return (
                          <div
                            key={`${item.label}-${index}`}
                            className="relative z-10 flex h-full flex-col items-center gap-2"
                            style={{ flex: `0 1 ${flexBasis}`, minWidth: "2.5rem" }}
                          >
                            <div className="flex h-full w-full items-end justify-center">
                              <div
                                className={`w-10 rounded-2xl bg-gradient-to-t ${barColor} shadow-inner transition-all duration-300`}
                                style={{ height: `${heightPercent}%` }}
                                aria-label={title}
                              >
                                <span className="sr-only">{title}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex items-start gap-4 text-sm text-slate-600">
                    {detections.length === 0 ? (
                      <span className="text-xs text-slate-400">Awaiting data</span>
                    ) : (
                      detections.map((item, index) => {
                        const rawValue =
                          typeof item.stockPercentage === "number"
                            ? item.stockPercentage
                            : typeof item.quantity === "number"
                              ? item.quantity
                              : 0;
                        const percentValue =
                          typeof item.stockPercentage === "number"
                            ? Math.round(item.stockPercentage)
                            : Math.round((rawValue / referenceValue) * 100);
                        return (
                          <div key={`${item.label}-${index}`} className="flex flex-1 flex-col items-center gap-1">
                            <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
                            <p className="text-xs text-slate-400">{`${Math.max(0, percentValue)}%`}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-gradient-to-br from-red-500 to-red-600 px-6 py-5 text-white shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <span aria-hidden="true">🔔</span>
              </div>
              <p className="text-sm text-white/80">
                {notifications.length > 0
                  ? `${notifications.length} alert${notifications.length > 1 ? "s" : ""} pending`
                  : "All stock levels look healthy."}
              </p>
            </div>

            <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {notifications.length === 0 ? (
                <div className="flex h-full items-center justify-center px-6 text-sm text-slate-400">
                  No notifications right now.
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {notifications.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="flex items-center gap-3 px-6 py-4">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{item.message}</p>
                        <p className="text-xs text-slate-400">
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleString()
                            : "Captured in latest upload"}
                        </p>
                      </div>
                      <span aria-hidden="true" className="text-slate-400">
                        ⏰
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="px-1 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">
              {batchTimestamp
                ? `Last sync ${new Date(batchTimestamp).toLocaleString()}`
                : "Awaiting camera upload"}
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
