import { useEffect, useMemo, type ReactNode } from "react";
import type { Route } from "./+types/home";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { useInventory } from "../context/inventory";
import type { Detection } from "../types/inventory";
import { requireAuth } from "../utils/auth.server";
import { Link } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFavorites } from "../context/favorites";
import { useNotifications, type NotificationItem } from "../context/notifications";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  return null;
}

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

export default function Home() {
  const {
    snapshot: { detections, batchTimestamp },
  } = useInventory();
  const { favorites } = useFavorites();
  const {
    active: notifications,
    reset: resetNotifications,
    dismiss: dismissNotification,
    hydrated: notificationsHydrated,
  } =
    useNotifications();

  const detectionLookup = useMemo(() => getDetectionLookup(detections), [detections]);

  const primaryValues = useMemo(
    () =>
      detections
        .map((item) =>
          typeof item.stockPercentage === "number"
            ? item.stockPercentage
            : typeof item.quantity === "number"
              ? item.quantity
              : null
        )
        .filter((value): value is number => value !== null && !Number.isNaN(value)),
    [detections]
  );

  const maxValue = primaryValues.length ? Math.max(...primaryValues) : 0;
  const referenceValue = Math.max(maxValue, OVERSTOCK_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD, 1);

  const chartData = useMemo(
    () =>
      detections.map((item) => {
        const rawValue =
          typeof item.stockPercentage === "number"
            ? item.stockPercentage
            : typeof item.quantity === "number"
              ? item.quantity
              : 0;

        const percentValue =
          typeof item.stockPercentage === "number"
            ? Math.round(item.stockPercentage)
            : referenceValue
              ? Math.round((rawValue / referenceValue) * 100)
              : 0;

        const normalizedPercent = Math.max(0, percentValue);

        return {
          name: item.label,
          percent: normalizedPercent,
          units: typeof item.quantity === "number" ? item.quantity : null,
          level: classifyPercentLevel(normalizedPercent),
        };
      }),
    [detections, referenceValue]
  );

  const notificationItems = useMemo<NotificationItem[]>(
    () =>
      chartData
        .filter((item) => item.percent < MEDIUM_THRESHOLD)
        .map((item) => {
          const detection = detectionLookup.get(item.name.toLowerCase());
          return {
            label: item.name,
            message: `${item.name} stock is low`,
            timestamp: detection?.timestamp,
          };
        }),
    [chartData, detectionLookup]
  );

  useEffect(() => {
    resetNotifications(notificationItems);
  }, [notificationItems, resetNotifications]);

  const notificationsList = notificationsHydrated ? notifications : notificationItems;

  const chartMaxPercent = chartData.length ? Math.max(...chartData.map((item) => item.percent)) : 0;
  const yDomain: [number, number] = [0, Math.max(chartMaxPercent, OVERSTOCK_THRESHOLD)];
  const yTicks =
    chartMaxPercent > 100
      ? [0, 50, 100, Math.ceil(chartMaxPercent / 10) * 10]
      : [0, 50, 100];
  const chartHeight = chartData.length > 0 ? Math.min(480, Math.max(320, 220 + chartData.length * 12)) : 320;
  const barCategoryGap = chartData.length > 7 ? "20%" : "28%";
  const BAR_GRADIENTS = {
    low: { id: "bar-low", from: "#fda4af", to: "#ef4444" },
    medium: { id: "bar-medium", from: "#fcd34d", to: "#f59e0b" },
    high: { id: "bar-high", from: "#6ee7b7", to: "#10b981" },
    overstock: { id: "bar-overstock", from: "#7dd3fc", to: "#0ea5e9" },
  } as const;

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
        {notificationsList.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {notificationsList.length}
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-[0.3em] text-slate-400">
              Favorites
            </h2>
            <Link
              to="/favorites"
              className="text-sm font-semibold text-red-500 transition hover:text-red-600"
            >
              Edit list
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-red-200 bg-white px-6 py-5 text-center text-sm text-red-400 shadow-sm">
                Add up to three favorites to keep tabs on quick stats.
              </div>
            ) : (
              favorites.map((label) => {
                const detection = detectionLookup.get(label.toLowerCase());
                const hasQuantity = typeof detection?.quantity === "number";
                const displayValue = hasQuantity
                  ? `${detection!.quantity} Units`
                  : typeof detection?.stockPercentage === "number"
                    ? `${detection.stockPercentage}%`
                    : "Awaiting data";
                const emoji = EMOJI_MAP[label.toLowerCase()] ?? "🛒";

                return (
                  <div
                    key={label}
                    className="rounded-3xl bg-gradient-to-br from-red-500 to-red-600 px-6 py-5 text-white shadow-lg"
                  >
                    <div className="flex items-center justify-between text-sm uppercase tracking-wide text-white/80">
                      <span>{label}</span>
                      <span aria-hidden="true" className="text-2xl">
                        {emoji}
                      </span>
                    </div>
                    <p className="mt-6 text-3xl font-semibold">{displayValue}</p>
                    {hasQuantity && typeof detection?.stockPercentage === "number" ? (
                      <p className="text-sm text-white/80">{detection.stockPercentage}% stock</p>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
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
            <div className="mt-6 rounded-3xl bg-slate-50/90 px-4 py-6">
              {chartData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                  Upload a snapshot to view stock levels.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={chartData} barCategoryGap={barCategoryGap}>
                    <defs>
                      {Object.values(BAR_GRADIENTS).map((gradient) => (
                        <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor={gradient.from} />
                          <stop offset="100%" stopColor={gradient.to} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                      domain={yDomain}
                      ticks={yTicks}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      width={44}
                      tickFormatter={(value: number) => {
                        if (value === 0) return "Low";
                        if (value === 50) return "Medium";
                        if (value === 100) return "High";
                        return `${value}%`;
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Stock"]}
                      labelFormatter={(label: string, payload) => {
                        const units = payload?.[0]?.payload?.units;
                        return typeof units === "number" ? `${label} • ${units} units` : label;
                      }}
                      cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                      wrapperStyle={{ outline: "none" }}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "#e2e8f0",
                        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
                      }}
                    />
                    <Bar
                      dataKey="percent"
                      radius={[18, 18, 12, 12]}
                      maxBarSize={64}
                      isAnimationActive={false}
                    >
                      <LabelList
                        dataKey="percent"
                        position="top"
                        formatter={(label: ReactNode) =>
                          typeof label === "number" ? `${label}%` : label
                        }
                        fill="#0f172a"
                        fontSize={12}
                      />
                      {chartData.map((item) => (
                        <Cell
                          key={item.name}
                          fill={`url(#${BAR_GRADIENTS[item.level].id})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-gradient-to-br from-red-500 to-red-600 px-6 py-5 text-white shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <span aria-hidden="true">🔔</span>
              </div>
              <p className="text-sm text-white/80">
                {notificationsList.length > 0
                  ? `${notificationsList.length} alert${notificationsList.length > 1 ? "s" : ""} pending`
                  : "All stock levels look healthy."}
              </p>
            </div>

            <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {notificationsList.length === 0 ? (
                <div className="flex h-full items-center justify-center px-6 text-sm text-slate-400">
                  No notifications right now.
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {notificationsList.map((item, index) => (
                    <li
                      key={`${item.label}-${index}`}
                      className="group flex items-center gap-3 px-6 py-4"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{item.message}</p>
                        <p className="text-xs text-slate-400">
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleString()
                            : "Captured in latest upload"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-slate-400 transition group-hover:text-red-500"
                        onClick={() => dismissNotification(item.label)}
                        aria-label={`Dismiss ${item.label} notification`}
                      >
                        <span className="block group-hover:hidden">⏰</span>
                        <span className="hidden group-hover:block text-lg leading-none">×</span>
                      </button>
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
  const EMOJI_MAP: Record<string, string> = {
    apples: "🍎",
    bananas: "🍌",
    "red potatoes": "🥔",
    "yellow potatoes": "🥔",
    "bagged potatoes": "🥔",
    "purple onions": "🧅",
    "red onions": "🧅",
    onions: "🧅",
    "russet potatoes": "🥔",
    cucumbers: "🥒",
    potatoes: "🥔",
    "packaged mushrooms": "🍄",
    eggplants: "🍆",
    zucchinis: "🥒",
    "sweet potatoes": "🍠",
    tomatoes: "🍅",
    garlic: "🧄",
    strawberries: "🍓",
  };
