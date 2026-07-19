import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان القصوى V4.
 * يعتمد المحرك كلياً على متغيرات البيئة (Secrets) لضمان عدم تسريب المفاتيح.
 */

export const ai = genkit({
  plugins: [
    // المحرك سيبحث تلقائياً عن GEMINI_API_KEY في بيئة النظام (Secrets)
    googleAI(),
  ],
});
