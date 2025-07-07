// /src/components/Layout.tsx
import { useRef, useEffect, useState } from "react";
import Navbar, { NavbarRef } from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navRef = useRef<NavbarRef>(null);
  const [paddingTop, setPaddingTop] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (navRef.current) {
        const height = navRef.current.getHeight();
        setPaddingTop(height);
      }
    };

    updateHeight(); // ดึงครั้งแรก
    window.addEventListener("resize", updateHeight); // ปรับตอนจอเปลี่ยนขนาด

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <>
      <Navbar ref={navRef} />
      <div style={{ paddingTop }}>
        {children}
      </div>
    </>
  );
}
