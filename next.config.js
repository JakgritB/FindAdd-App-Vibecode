/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_LONGDO_API_KEY: process.env.LONGDO_API_KEY,
  },
}

module.exports = nextConfig