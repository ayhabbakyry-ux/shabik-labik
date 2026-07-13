# شبك لبيك الرقمي - دليل النشر وحلول المشاكل التقنية

هذا المشروع مجهز ليعمل كمنصة خدمات رقمية متكاملة.

## 1. حل مشكلة صلاحيات Git (Authentication Failed)
إذا واجهت خطأ `No anonymous write access` عند محاولة رفع الكود لـ GitHub، يرجى تنفيذ الأمر التالي في Terminal بعد استبدال `<TOKEN>` بمفتاح الوصول الخاص بك:

```bash
git remote set-url origin https://<YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/ayhabbakyry-ux/shabik-labik.git
```

## 2. الضبط السحابي (Environment Variables)
يجب إضافة المتغيرات التالية في لوحة تحكم Vercel/App Hosting لضمان عمل السيرفر:
- **ALRAGHEB_TOKEN**: `64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0`
- **GEMINI_API_KEY**: (مفتاح جوجل الخاص بك للذكاء الاصطناعي)

## 3. الملاحظات التقنية للإصدار الأخير
- **إصلاح الانهيار**: تم حل مشكلة `experimentalForceLongPolling` ومنع تعارض الإعدادات.
- **إصلاح لوحة الإدارة**: تم حل مشكلة `Duplicate Key` باستخدام المعرف الفريد `id` لضمان ظهور كافة البيانات.
- **دعم الأجهزة**: تم تحسين استقرار الاتصال ليعمل بكفاءة على أجهزة Samsung و Infinix عبر تقنية Long Polling.

© 2024 شبك لبيك الرقمي. جميع الحقوق محفوظة.
