import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mandel59/mojidata-api'],
  outputFileTracingIncludes: {
    '/**': [
      'node_modules/@mandel59/mojidata/dist/moji.db',
      'node_modules/@mandel59/idsdb/idsfind.db',
      'node_modules/sql.js/**',
      'src/server/mojidataApiWorker.cjs',
      'node_modules/@mandel59/mojidata-api/**',
      'node_modules/@mandel59/idsdb-utils/**',
    ],
  },
  turbopack: {
    rules: {
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
    if (!isServer) {
      config.resolve ??= {}
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        path: false,
      }
    }
    return config
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/search',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
