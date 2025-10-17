import type { Route } from "./+types/upload";
import UploadImage from "../components/ImageUpload";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { requireAuth } from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  return null;
}

export default function UploadPage() {
  return (
    <DashboardLayout title="All Stock" activeNav="cameras">
      <UploadImage />
    </DashboardLayout>
  );
}
