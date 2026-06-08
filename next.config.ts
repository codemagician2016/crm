/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          }
        ]
      }
    ]
  },
  transpilePackages: [
    '@mui/x-charts',
    '@mui/system',
    '@mui/material',
    '@mui/icons-material'
  ],
  webpack: (config: any) => {
    config.resolve.alias = {
      ...(config?.resolve?.alias || {}),
      '@mui/styled-engine': '@mui/styled-engine-sc',
    };
    return config;
  }
};

export default nextConfig;
