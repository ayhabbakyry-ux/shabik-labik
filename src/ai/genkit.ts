import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان الصارمة V7.
 * تم ضبط المحرك ليعمل بنظام "الأمان الصامت" لتجنب أخطاء السيرفر.
 */

export const ai = genkit({
  plugins: [
    googleAI({
      // يقرأ المفتاح من بيئة النظام (Secrets) حصراً
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
