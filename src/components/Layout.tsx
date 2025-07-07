// /src/components/Layout.tsx
import { useRef, useEffect, useState } from "react";
import Navbar from "@/components/NavbarNew";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
