// pages/_app.tsx
import '@/styles/globals.css';
import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";

import { Noto_Sans_Thai, Kanit } from 'next/font/google';

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-body',
});

const kanit = Kanit({
  subsets: ['thai'],
  weight: ['600', '700'],
  variable: '--font-header',
});


function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      {/* โหลด Google Maps */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="beforeInteractive"
      />
      {/* ใส่ font variable เข้า main */}
      <main className={`${notoSansThai.variable} ${kanit.variable}`}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}

export default MyApp;


