// pages/store/dashboard.tsx
import dynamic from 'next/dynamic';

const ClientDashboard = dynamic(() => import('../../components/ClientDashboard'), {
  ssr: false,
});

export default function DashboardPage() {
  return <ClientDashboard />;
}
