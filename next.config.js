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
}

module.exports = nextConfig
