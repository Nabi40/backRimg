/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    disableOptimizedLoading: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
};

export default nextConfig;
