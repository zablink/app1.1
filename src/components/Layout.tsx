// src/components/Layout.tsx
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-16"> {/* ดันเนื้อหาลงตามความสูง navbar */}
        {children}
      </div>
    </>
  );
}
