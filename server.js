// This file is only used in production (Railway).
// Next.js standalone server reads process.env.PORT automatically.
// Railway sets PORT=8080 via nixpacks.toml.
process.env.PORT = process.env.PORT || '8080'
process.env.HOSTNAME = '0.0.0.0'

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('./.next/standalone/server.js')
