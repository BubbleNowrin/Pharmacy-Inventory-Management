/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'],
  experimental: {
    // Remove turbo config as it's causing issues
  }
}

module.exports = nextConfig
