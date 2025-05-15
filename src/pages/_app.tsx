// pages/_app.tsx
import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react"; // 👈 เพิ่ม
import Script from "next/script";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
