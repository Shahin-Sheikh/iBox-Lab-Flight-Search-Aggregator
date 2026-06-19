/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Surface type and lint errors at build time rather than silently shipping.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
