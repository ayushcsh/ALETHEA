/** @type {import('next').NextConfig} */

const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // External packages for server components
  serverExternalPackages: ['@tailwindcss/typography', 'pdf-parse'],
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `canvas` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    
    
    return config;
  },
  
  // Configure images
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Enable SWC minification
  // swcMinify: false,
  
  // Enable standalone output for better compatibility with Vercel
  output: 'standalone',
  
  // Configure environment variables
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'production',
  },
};

export default nextConfig;
