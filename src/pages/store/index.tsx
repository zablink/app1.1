// pages/store/index.tsx
import dynamic from "next/dynamic";

// โหลด StoreDashboard แบบ client-only
const StoreDashboard = dynamic(() => import("../../components/StoreDashboard"), {
  ssr: false,
});

export default function StorePage() {
  return <StoreDashboard />;
}
