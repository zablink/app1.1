// pages/api/debug-env.ts
export default function handler(req, res) {
  res.status(200).json({
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
  });
}
