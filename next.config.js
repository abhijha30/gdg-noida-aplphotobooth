/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // disabled to prevent double camera init
  images: {
    unoptimized: true,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
      ],
    },
  ],
};

module.exports = nextConfig;
