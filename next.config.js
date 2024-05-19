/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    })
    return config
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/idsfind',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
