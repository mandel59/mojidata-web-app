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
        destination: '/search',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
