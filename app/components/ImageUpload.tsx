import React, { useMemo, useState } from "react";

type Result = {
  stock_percentage: number;
  type: string;
  ts?: string;
};

function UploadImage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // URLs from .env.local (with a safe default for mock)
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  const mockBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "/mock";

  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const postImage = async (baseUrl: string, form: FormData) => {
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/upload/`, {
      method: "POST",
      body: form,
    });
    if (!resp.ok) throw new Error(`Upload failed: ${resp.status} ${resp.statusText}`);
    return (await resp.json()) as Result;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("uploaded_at", "0");

    try {
      // Try real backend first if configured
      if (backendUrl) {
        try {
          const data = await postImage(backendUrl, formData);
          setResult(data);
          return;
        } catch (e) {
          // Fall through to mock
          console.warn("Backend not reachable, falling back to mock.", e);
        }
      }
      // Fallback to mock endpoint served by Vite dev server
      const data = await postImage(mockBaseUrl, formData);
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-lg border border-gray-200/30 bg-white/5 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <input
          id="file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
        />
        <label
          htmlFor="file"
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Choose Image
        </label>
        <span className="text-sm text-gray-400">
          {selectedFile ? selectedFile.name : "No file chosen"}
        </span>
      </div>

      {previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 w-auto rounded-md border border-gray-200/30"
          />
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <div className="mt-3 text-sm text-red-400">Error: {error}</div>}
      {result && (
        <div className="mt-4 rounded-md border border-gray-200/30 p-4">
          <p>
            <span className="font-semibold">Stock Level:</span> {result.stock_percentage}
          </p>
          <p>
            <span className="font-semibold">Type:</span> {result.type}
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadImage;
