import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'api.yarijoo.ir', pathname: '/**' },
            { protocol: 'http', hostname: 'localhost', port: '3333', pathname: '/**' },
            { protocol: 'http', hostname: '127.0.0.1', port: '3333', pathname: '/**' },
        ],
    },
    experimental: {
        optimizePackageImports: ['framer-motion'],
    },
}

export default nextConfig
