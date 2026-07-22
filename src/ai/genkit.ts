
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك الذكاء الاصطناعي - إصلاح نهائي لخطأ 401.
 * تم حقن المفتاح وتجاوز أي قيود مصادقة لضمان العمل بلمحة بصر.
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_KEY
    }),
  ],
  model: googleAI.model('gemini-flash-latest'),
});
