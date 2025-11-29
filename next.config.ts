// ARQUIVO DE CONFIGURAÇÃO DO NEXT.JS
//
// Propósito:
// Este arquivo configura o comportamento do framework Next.js. Ele permite personalizar
// funcionalidades como o sistema de build, roteamento, headers, e otimização de imagens.
//
// Responsabilidade:
// - Definir configurações globais para a aplicação Next.js.
// - Configurar padrões de imagens remotas para o componente <Image>.
// - Ignorar erros de build específicos (TypeScript, ESLint) se necessário.
// - Habilitar ou desabilitar funcionalidades experimentais.
// - Adicionar a configuração `allowedDevOrigins` para permitir requisições cross-origin
//   do ambiente de desenvolvimento (Firebase Studio).

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Allow cross-origin requests from the Firebase Studio development environment
  // to support features like Hot Module Replacement (HMR).
  allowedDevOrigins: [
    'https://*.cluster-udxxdyopu5c7cwhhtg6mmadhvs.cloudworkstations.dev',
  ],
};

export default nextConfig;
