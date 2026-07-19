import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview محرك "شبيك لبيك" المطور - نسخة الأمان القصوى (V4).
 * تم منع تخزين المفاتيح داخل الكود أو ملفات الـ .env نهائياً.
 * يعتمد النظام الآن حصراً على متغير البيئة GEMINI_API_KEY المرفوع في Secrets.
 */

const getSecureApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  
  if (!key) {
    // إشعار للمطور في لوحة التحكم بدون إظهار بيانات حساسة
    console.error("[Security] 🛡️ تنبيه أمني: مفتاح API مفقود من متغيرات البيئة. يرجى إضافته في إعدادات Secrets.");
    return "NOT_CONFIGURED";
  }
  
  return key;
};

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: getSecureApiKey()
    })
  ],
  // استخدام المعرف الرمزي الأكثر استقراراً وتوافقاً مع مكتبة 1.29
  model: googleAI.model('gemini-flash-latest'),
});
