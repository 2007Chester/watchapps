/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Определяем backend URL в зависимости от окружения
    let backendUrl = process.env.BACKEND_URL;
    
    if (!backendUrl) {
      // В production используем localhost:8000 (Laravel на том же сервере)
      // В development тоже localhost:8000
      backendUrl = 'http://localhost:8000';
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

