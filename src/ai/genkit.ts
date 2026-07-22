
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك الذكاء الاصطناعي - إصلاح نهائي وصارم لخطأ 401.
 * تم حقن المفتاح المباشر لضمان عمل المصباح السحري بلمحة بصر.
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
