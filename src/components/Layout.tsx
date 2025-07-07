// Layout.tsx
import { useEffect, useRef, useState } from "react";
import Navbar, { NavbarRef } from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navRef = useRef<NavbarRef>(null);
  const [paddingTop, setPaddingTop] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (navRef.current) {
        setPaddingTop(navRef.current.getHeight());
      }
    };

    updateHeight(); // ดึงตอนแรก
    window.addEventListener("resize", updateHeight); // ถ้ามี resize

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
