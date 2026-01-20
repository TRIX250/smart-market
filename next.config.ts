const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.43.45:3000', '10.15.37.106:3000', 'localhost:3000']
    }
  }
};

export default nextConfig;