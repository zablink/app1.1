// src/pages/_app.tsx

import type { AppProps } from 'next/app';
import '../styles/globals.css'; // ตรวจสอบเส้นทางของไฟล์ CSS หลักของคุณ

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  );
}

export default MyApp;