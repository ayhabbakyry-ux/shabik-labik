# Shabik Labik Digital - Vercel Production Ready

هذا المشروع مجهز للنشر المباشر على Vercel لتجاوز قيود الـ IP الخاصة ببيئات التطوير السحابية.

## حل مشكلة Git Remote (fatal: 'origin' does not appear)
إذا ظهر لك خطأ "origin does not appear"، نفذ الأوامر التالية بالترتيب في الـ Terminal:

1. **إعداد Git (إذا لم يكن معداً):**
   ```bash
   git init
   ```

2. **ربط المستودع بـ GitHub:**
   *(استبدل رابط المستودع بالرابط الخاص بك من GitHub)*
   ```bash
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   ```

3. **رفع الكود:**
   ```bash
   git add .
   git commit -m "Production ready for Vercel"
   git branch -M main
   git push -u origin main
   ```

## المميزات المدمجة للإنتاج
- **Clean Backend Proxy**: بروكسي خلفي مطهر من كافة الترويسات السحابية لتجنب اكتشاف الفلاتر.
- **Auto-Sync**: مزامنة حية من سيرفرات الراغب باستخدام بيانات الاعتماد المباشرة.
- **Safe Margin**: تطبيق عمولة 4% آلياً على كافة المنتجات.
- **Vercel Optimized**: إعدادات جاهزة للنشر المجاني الفوري.

© 2024 Shabik Labik Digital.
