import UploadImage from "../components/ImageUpload";

export default function UploadPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h2 className="mb-4 text-2xl font-semibold">Upload Stock Image</h2>
      <UploadImage />
    </main>
  );
}
