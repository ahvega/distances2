/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We run ESLint via `npm run lint`; skip during `next build` to avoid version conflicts
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type-checking is handled separately; keep build unblocked
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

