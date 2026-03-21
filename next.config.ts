/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! PERICOLO !!
    // Questo permette alla build di completarsi con successo anche se
    // il progetto ha errori TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora anche gli errori di linting durante la build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;