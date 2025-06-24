/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Enable SWC minification
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable the app directory to prevent conflicts
  experimental: {
    // Add any experimental features here if needed
  },
};

module.exports = nextConfig;
