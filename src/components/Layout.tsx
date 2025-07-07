// /src/components/Layout.tsx
import { useRef, useEffect, useState } from "react";
import Navbar, { NavbarRef } from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
