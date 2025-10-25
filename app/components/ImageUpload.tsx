import React, { useEffect, useMemo, useState } from "react";

import { useInventory } from "../context/inventory";
import type { Detection, InventorySnapshot } from "../types/inventory";

import Cookies from "js-cookie";

const createMockResponse = (): InventorySnapshot => ({
  batchTimestamp: new Date().toISOString(),
  detections: [
    { label: "Potatoes", quantity: 20, stockPercentage: 68, confidence: 97 },
    { label: "Apples", quantity: 15, stockPercentage: 54, confidence: 92 },
    { label: "Strawberries", quantity: 5, stockPercentage: 32, confidence: 88 },
    { label: "Watermelons", quantity: 6, stockPercentage: 42, confidence: 90 },
    { label: "Bananas", quantity: 10, stockPercentage: 61, confidence: 95 },
  ],
});

function UploadImage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentItems, setRecentItems] = useState<Detection[]>([]);

  // URLs from .env.local (with a safe default for mock)
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  const mockBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "/mock";

  const { setSnapshot } = useInventory();

  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
      setRecentItems([]);
    }
  };

  const normalizeDetections = (payload: unknown): InventorySnapshot => {
    // debug thingy, remember to wipe.
    console.log(payload)
    const toDetection = (raw: any): Detection | null => {
      if (!raw || typeof raw !== "object") return null;

      const label =
        (raw.type ?? raw.label ?? raw.name ?? raw.product ?? raw.item ?? "")
          .toString()
          .trim();

      if (!label) return null;

      const quantity =
        raw.quantity ?? raw.count ?? raw.amount ?? raw.units ?? raw.total ?? undefined;
      const stockPercentage =
        raw.stock_percentage ?? raw.stockPercentage ?? raw.percentage ?? raw.stockLevel ?? undefined;
      const confidenceValue = raw.confidence ?? raw.probability ?? raw.score ?? undefined;
      const timestamp = raw.ts ?? raw.timestamp ?? raw.capturedAt ?? undefined;

      return {
        label,
        quantity: typeof quantity === "number" ? quantity : undefined,
        stockPercentage:
          typeof stockPercentage === "number" ? Math.round(stockPercentage) : undefined,
        confidence:
          typeof confidenceValue === "number"
            ? confidenceValue <= 1
              ? Math.round(confidenceValue * 100)
              : Math.round(confidenceValue)
            : undefined,
        timestamp: typeof timestamp === "string" ? timestamp : undefined,
      } satisfies Detection;
    };

    const wrap = (items: Detection[], ts?: string): InventorySnapshot => ({
      detections: items,
      batchTimestamp: ts,
    });

    if (Array.isArray(payload)) {
      const items = payload.map(toDetection).filter(Boolean) as Detection[];
      return wrap(items);
    }

    if (payload && typeof payload === "object") {
      if (Array.isArray((payload as any).detections)) {
        const items = ((payload as any).detections as unknown[])
          .map(toDetection)
          .filter(Boolean) as Detection[];
        return wrap(items, (payload as any).timestamp ?? (payload as any).ts ?? undefined);
      }

      if (Array.isArray((payload as any).items)) {
        const items = ((payload as any).items as unknown[])
          .map(toDetection)
          .filter(Boolean) as Detection[];
        return wrap(items, (payload as any).timestamp ?? (payload as any).ts ?? undefined);
      }

      const single = toDetection(payload);
      if (single) {
        return wrap([single], single.timestamp ?? (payload as any).ts ?? undefined);
      }
    }

    return wrap([]);
  };

  const postImage = async (baseUrl: string, form: FormData) => {
    if (baseUrl.startsWith("/mock")) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return createMockResponse();
    }

    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/upload/`, {
      method: "POST",
      body: form,
    });
    if (!resp.ok) throw new Error(`Upload failed: ${resp.status} ${resp.statusText}`);
    const payload = await resp.json();
    const normalized = normalizeDetections(payload);

    return normalized;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setRecentItems([]);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const cookies = Cookies.get("login_token");
    console.log(cookies);

    try {
      // Try real backend first if configured
      if (backendUrl) {
        try {
          const data = await postImage(backendUrl, formData);
          setSnapshot(data);
          setRecentItems(data.detections);
          if (data.detections.length === 0) {
            setError("No stock items detected in this image.");
          }
          return;
        } catch (e) {
          // Fall through to mock
          console.warn("Backend not reachable, falling back to mock.", e);
        }
      }
      // Fallback to mock endpoint served by Vite dev server
      const data = await postImage(mockBaseUrl, formData);
      setSnapshot(data);
      setRecentItems(data.detections);
      if (data.detections.length === 0) {
        setError("No stock items detected in this image.");
      }
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-3xl text-slate-400">
          🖼️
        </div>
        <h2 className="mt-6 text-lg font-semibold text-slate-900">Upload camera snapshot</h2>
        <p className="mt-2 text-sm text-slate-500">
          Please upload a square image under 50MB. Supported formats: PNG.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-center">
          <input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
          <label
            htmlFor="file"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50"
          >
            Choose File
          </label>
          <span className="text-sm text-slate-400">
            {selectedFile ? selectedFile.name : "No file chosen"}
          </span>
        </div>

        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Uploading…" : "Save"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">Error: {error}</p>
        )}
        {!error && recentItems.length > 0 && (
          <p className="mt-4 text-sm text-emerald-600">
            Analysis saved. View detailed insights on the dashboard.
          </p>
        )}
      </section>

      {previewUrl && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
          <img
            src={previewUrl}
            alt="Selected preview"
            className="mt-4 w-full rounded-xl border border-slate-100 object-cover"
          />
        </section>
      )}
    </div>
  );
}

export default UploadImage;
