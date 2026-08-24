/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // Allow the development server to be accessed through this origin.
  allowedDevOrigins: ['192.168.56.1'],

  // Pre-bundle the heavy 3D libs so dev cold-compiles are faster.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@react-three/drei',
      '@react-three/fiber',
      'motion',
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig