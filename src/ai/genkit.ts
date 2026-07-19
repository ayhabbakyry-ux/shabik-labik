import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان القصوى V5.
 * يعتمد المحرك كلياً على متغيرات البيئة (Secrets) لضمان عدم تسريب المفاتيح لـ GitHub.
 */

export const ai = genkit({
  plugins: [
    googleAI({
      // المحرك سيبحث تلقائياً عن المفتاح في بيئة النظام (Secrets)
      // نستخدم الاسم GEMINI_API_KEY كونه الاسم المعتمد في إعداداتك
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
