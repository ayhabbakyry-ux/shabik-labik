
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك الذكاء الاصطناعي - إصلاح نهائي لخطأ 401.
 * تم حقن المفتاح يدوياً ومن البيئة لضمان المصادقة المطلقة.
 */

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU"
    }),
  ],
  model: googleAI.model('gemini-flash-latest'),
});
