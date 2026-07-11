import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview إعدادات محرك Genkit - تم حقن المفتاح مباشرة لضمان العمل الفوري.
 */

export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
    })
  ],
});
