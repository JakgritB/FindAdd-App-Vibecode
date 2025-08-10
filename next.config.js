/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_LONGDO_API_KEY: process.env.LONGDO_API_KEY,
  },
  typescript: {
    // แสดง error ทั้งหมดแต่ไม่หยุด build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ปิด ESLint ชั่วคราวเพื่อดู TypeScript errors ทั้งหมด
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig