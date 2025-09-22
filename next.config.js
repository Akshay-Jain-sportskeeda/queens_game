/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  //basePath: '/games/nfl-octobox',
  //assetPrefix: '/games/nfl-octobox/',
  images: {
    domains: ['docs.google.com'],
  },
  async headers() {
    return [
      {
        source: '/api/puzzle-data',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
