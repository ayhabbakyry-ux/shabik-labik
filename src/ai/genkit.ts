import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان المطلق (V7).
 * تم تحسين التهيئة لمنع انهيار السيرفر (Internal Server Error) في حال غياب المفتاح.
 */

// جلب المفتاح بأمان - يدعم GEMINI_API_KEY أو GOOGLE_GENAI_API_KEY تلقائياً
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "";

export const ai = genkit({
  plugins: [
    googleAI(apiKey ? { apiKey } : {})
  ],
  // استخدام الموديل المستقر والأكثر توافقاً
  model: googleAI.model('gemini-flash-latest'),
});
