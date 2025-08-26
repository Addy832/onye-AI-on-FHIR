/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Output configuration for Netlify static deployment
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  },
  
  // Image optimization
  images: {
    unoptimized: true, // For static export compatibility
    domains: ['localhost'],
  },
  
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  
  // Webpack configuration for healthcare libraries
  webpack: (config, { isServer }) => {
    // Handle canvas for Chart.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
