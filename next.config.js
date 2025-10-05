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
          // Development optimizations
          ...(isDev && {
            webpack: (config, { dev }) => {
              if (dev) {
                // Disable webpack cache in development to prevent stale issues
                config.cache = false;
                // Optimize for faster rebuilds
                config.watchOptions = {
                  poll: 1000,
                  aggregateTimeout: 300,
                };
              }
              return config;
            },
          }),
}

module.exports = nextConfig
