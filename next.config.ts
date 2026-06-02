import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Ensure images from public/ are allowed
  images: {
    unoptimized: true,
  },
}

export default nextConfig
