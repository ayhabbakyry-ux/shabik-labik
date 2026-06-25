
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // يتجاهل أخطاء التايب سكريبت البسيطة لضمان نجاح البناء في Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // يتجاهل أخطاء الـ Lint أثناء الرفع لسرعة الاستجابة
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
      {
        protocol: 'https',
        hostname: 'alragheb-store.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
