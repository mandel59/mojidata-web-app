import type { NextConfig } from 'next'

const spaAssetCacheControl =
  process.env.NODE_ENV === 'production'
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=0, must-revalidate'

const spaAssetHeadersCommon = [
  { key: 'Cache-Control', value: spaAssetCacheControl },
  { key: 'Vary', value: 'Accept-Encoding' },
]

const nextConfig: NextConfig = {
  transpilePackages: ['@mandel59/mojidata-api'],
  env: {
    NEXT_PUBLIC_SPA_ASSET_VERSION:
      process.env.NEXT_PUBLIC_SPA_ASSET_VERSION ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.VERCEL_DEPLOYMENT_ID ??
      process.env.npm_package_version ??
      '',
  },
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
  async headers() {
    return [
      {
        source: '/assets/sql-wasm.wasm',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/wasm' },
        ],
      },
      {
        source: '/assets/sql-wasm.wasm.br',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Content-Encoding', value: 'br' },
        ],
      },
      {
        source: '/assets/sql-wasm.wasm.gz',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Content-Encoding', value: 'gzip' },
        ],
      },
      {
        source: '/assets/moji.db',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/octet-stream' },
        ],
      },
      {
        source: '/assets/moji.db.br',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Content-Encoding', value: 'br' },
        ],
      },
      {
        source: '/assets/moji.db.gz',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Content-Encoding', value: 'gzip' },
        ],
      },
      {
        source: '/assets/idsfind.db',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/octet-stream' },
        ],
      },
      {
        source: '/assets/idsfind.db.br',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Content-Encoding', value: 'br' },
        ],
      },
      {
        source: '/assets/idsfind.db.gz',
        headers: [
          ...spaAssetHeadersCommon,
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Content-Encoding', value: 'gzip' },
        ],
      },
    ]
  },
}

export default nextConfig
