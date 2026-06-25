/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
# show next version (or absence)
npm ls next --depth=0 || cat package.json | grep '"next"'
