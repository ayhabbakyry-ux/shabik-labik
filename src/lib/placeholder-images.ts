import data from '@/app/lib/placeholder-images.json';

/**
 * @fileOverview فهرس الصور - تم تصحيح المسار لجلب البيانات الحقيقية ومنع أخطاء الـ SSR.
 */

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
