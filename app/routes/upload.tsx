import UploadImage from "../components/ImageUpload";
import { DashboardLayout } from "../components/layouts/DashboardLayout";

export default function UploadPage() {
  return (
    <DashboardLayout title="All Stock" activeNav="cameras">
      <UploadImage />
    </DashboardLayout>
  );
}
