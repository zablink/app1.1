// src/app/layout.tsx
import type { Metadata } from "next";
import { Noto_Sans_Thai, Kanit } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400", "500", "700"], // ใช้หลายน้ำหนักตามการใช้งาน
  variable: "--font-body",
});

const kanit = Kanit({
  subsets: ["thai"],
  weight: ["600", "700"], // สำหรับหัวข้อ
  variable: "--font-header",
});

export const metadata: Metadata = {
  title: "ZabLink",
  description: "รวมร้านค้า",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} ${kanit.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}

