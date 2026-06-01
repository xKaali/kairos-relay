import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Required for Railway — listens on 8080
  // Railway sets PORT env var automatically
  output: 'standalone',
}

export default nextConfig
