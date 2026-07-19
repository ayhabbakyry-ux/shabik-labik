import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان والاستقرار القصوى (V10).
 * تم ضبط المحرك ليكون مقاوماً للانهيار (Crash-proof) تماماً.
 */

// جلب المفتاح بذكاء
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

// تهيئة المحرك بنظام الأمان الصامت
export const ai = genkit({
  plugins: [
    // لا نمرر كائناً فارغاً أبداً، بل نمرر المفتاح فقط إذا وجد أو نترك المكتبة تبحث عنه
    apiKey ? googleAI({ apiKey }) : googleAI()
  ],
  model: googleAI.model('gemini-flash-latest'),
});
