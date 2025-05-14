// pages/upgrade-to-store.tsx
import dynamic from 'next/dynamic';

const UpgradeClient = dynamic(() => import('../components/UpgradeClient'), {
  ssr: false, // <== สำคัญมาก: ปิด SSR เพื่อหลีกเลี่ยง useSession() error
});

export default function UpgradePage() {
  return <UpgradeClient />;
}
