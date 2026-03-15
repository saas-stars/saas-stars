import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin Analytics | SaaS Stars",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <AdminDashboard />
    </div>
  );
}
