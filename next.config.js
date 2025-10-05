/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  // Static export only for production (GitHub Pages)
  ...(!isDev && {
    output: 'export',
    trailingSlash: true,
    basePath: '/MHWilds-talisman-manager',
    assetPrefix: '/MHWilds-talisman-manager/',
  }),
  images: {
    unoptimized: true
  },
          // Development optimizations - disable all caching for stable hot reload
          ...(isDev && {
            webpack: (config, { dev }) => {
              if (dev) {
                // Completely disable all caching to prevent stale issues
                config.cache = false;
                config.snapshot = { managedPaths: [] };
                config.optimization = {
                  ...config.optimization,
                  moduleIds: 'named',
                  chunkIds: 'named',
                };
                // Optimize for faster rebuilds
                config.watchOptions = {
                  poll: 1000,
                  aggregateTimeout: 300,
                  ignored: /node_modules/,
                };
              }
              return config;
            },
          }),
}

module.exports = nextConfig
