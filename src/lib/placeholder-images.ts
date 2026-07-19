import data from '@/app/lib/placeholder-images.json';

/**
 * @fileOverview فهرس الصور - نسخة الاستقرار.
 */

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = (data as any).placeholderImages || [];
