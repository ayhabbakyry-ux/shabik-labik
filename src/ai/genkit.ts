import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان القصوى V2.
 * هذا المحرك مصمم ليكون "صامتاً" ولا يسبب انهيار السيرفر (500) في حال فقدان المفتاح.
 */

// جلب المفتاح من بيئة النظام حصراً (Secrets)
const apiKey = process.env.GEMINI_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI({ apiKey })
  ],
});
