/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pvcanhsbbuktocfleuld.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        pathname: '/attachments/**',
      },
      // Adicione outros hostnames de imagem aqui, se necessário
    ],
  },
};

module.exports = nextConfig;