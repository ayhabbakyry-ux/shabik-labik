import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك الذكاء الاصطناعي - إصلاح خطأ 401 النهائي.
 * تم ضبط المحرك لقراءة المفتاح بأمان من متغيرات البيئة.
 */

export const ai = genkit({
  plugins: [
    googleAI({
      // محاولة قراءة المفتاح من كافة المصادر الممكنة لضمان المصادقة
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});
