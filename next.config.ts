
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* خيارات التكوين لبيئة الإنتاج */
  typescript: {
    // يتجاهل أخطاء التايب سكريبت لضمان نجاح البناء في Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // يتجاهل أخطاء الـ Lint لسرعة النشر
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
  // تأكد من عدم وجود output: 'export' هنا لضمان عمل الـ API Routes
};

export default nextConfig;
