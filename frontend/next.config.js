/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Enable SWC minification
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Pin the Turbopack workspace root to this package to silence multi-lockfile warnings
  turbopack: {
    root: __dirname,
  },
  // No need to disable app directory - we're using it now!
}

module.exports = nextConfig
