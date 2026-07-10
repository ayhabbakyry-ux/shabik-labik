import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview إعدادات محرك Genkit - تم استخدام المكون الإضافي الحديث لضمان استقرار الذكاء الاصطناعي.
 */

export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: process.env.GEMINI_API_KEY,
    })
  ],
});
