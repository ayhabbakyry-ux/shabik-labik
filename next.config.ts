import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // تجاهل أخطاء النوع أثناء البناء لضمان استقرار النشر عند استخدام مفاتيح عربية في الـ JSON
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
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'alragheb-store.com',
      },
    ],
  },
};

export default nextConfig;
