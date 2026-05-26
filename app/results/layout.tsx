import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function ResultsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
