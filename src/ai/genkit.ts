import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان القصوى V3.
 * تم ضبط المحرك ليكون مقاوماً للانهيار (Crash-proof) في حال غياب المفتاح.
 */

const apiKey = process.env.GEMINI_API_KEY;

// تهيئة المحرك مع إضافة الإضافات فقط إذا كان المفتاح متوفراً
export const ai = genkit({
  plugins: apiKey ? [googleAI({ apiKey })] : [],
});
