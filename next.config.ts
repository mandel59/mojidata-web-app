import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mandel59/mojidata-api'],
  outputFileTracingIncludes: {
    '/**': [
      'node_modules/@mandel59/mojidata/dist/moji.db',
      'node_modules/@mandel59/idsdb/idsfind.db',
      'node_modules/sql.js/dist/sql-wasm.wasm',
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
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
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
