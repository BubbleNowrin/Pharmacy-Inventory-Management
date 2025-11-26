/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'],
  experimental: {
    turbo: false
  }
}

module.exports = nextConfig