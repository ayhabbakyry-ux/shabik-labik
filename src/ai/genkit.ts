import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان القصوى V6.
 * تم ضبط المحرك ليعتمد كلياً على بيئة النظام الآمنة (Secrets).
 */

export const ai = genkit({
  plugins: [
    googleAI({
      // يقرأ المفتاح من إعدادات السيرفر المخفية لضمان عدم تسريبه
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
