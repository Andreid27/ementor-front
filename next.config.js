/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,

  // Temporarily ignore TypeScript and ESLint errors during build so CI/Docker can complete.
  // NOTE: This bypass is intentional per user request. Remove these flags after fixing types.
  typescript: {
    // WARNING: Ignoring build errors may allow type-unsafe code into production.
    ignoreBuildErrors: true
  },
  eslint: {
    // WARNING: Ignores ESLint errors during production builds.
    ignoreDuringBuilds: true
  },

  // Only treat these extensions as Next.js pages. Exclude plain `.ts` files which are used
  // as helper modules inside the pages directory and should not be considered pages.
  pageExtensions: ['tsx', 'jsx', 'js'],
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
