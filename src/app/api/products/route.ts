import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار جلب المنتجات المطور - مع نظام معالجة أخطاء متقدم ومهلة انتظار طويلة للشبكات الضعيفة.
 * تم تحديثه لضمان جلب كافة الفئات الـ 60+ عبر معالجة البيانات العميقة (Deep Data Mapping).
 */
export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products';

    if (!API_TOKEN) {
        return NextResponse.json({ success: false, error: "التوكن مفقود في إعدادات السيرفر" }, { status: 200 });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // مهلة 30 ثانية لضمان جلب القائمة الضخمة

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json({ success: false, error: `خطأ اتصال: ${response.status}` }, { status: 200 });
        }

        const rawData = await response.json();
        
        // منطق ذكي لاستخراج مصفوفة المنتجات مهما كان عمقها أو تسميتها في الـ API
        let productsArray: any[] = [];
        
        if (Array.isArray(rawData)) {
            productsArray = rawData;
        } else if (rawData && typeof rawData === 'object') {
            // فحص كافة المفاتيح المحتملة للمصفوفات (data هي الأساسية، والبقية كإجراء احتياطي)
            if (rawData.data && Array.isArray(rawData.data)) {
                productsArray = rawData.data;
            } else if (rawData.products && Array.isArray(rawData.products)) {
                productsArray = rawData.products;
            } else if (rawData.items && Array.isArray(rawData.items)) {
                productsArray = rawData.items;
            } else {
                // البحث التلقائي عن أول مفتاح يحتوي على مصفوفة (للمرونة المطلقة)
                const possibleKey = Object.keys(rawData).find(key => Array.isArray(rawData[key]));
                productsArray = possibleKey ? rawData[possibleKey] : [];
            }
        }

        // تحويل البيانات الخام إلى الشكل الذي تحتاجه الواجهة مع حماية كاملة وفحص عميق للفئات
        const formattedProducts = productsArray.map((prod: any) => {
            const name = prod.الاسم || prod.name || prod.title || prod.product_name || 'منتج غير مسمى';
            const price = prod.السعر || prod.price || prod.cost || 0;
            
            // معالجة الفئة (Category) باستخدام Optional Chaining لضمان جلب الأقسام الـ 60 كاملة
            // ندعم الاسم المباشر، أو الحقل المتداخل، أو مسميات بديلة مثل section و group
            const categoryName = prod.اسم_الفئة || 
                               prod.category_name || 
                               prod.category?.name || 
                               prod.section?.name || 
                               prod.group_name || 
                               '';
                               
            const categoryId = prod.category_id || 
                             prod.parent_id || 
                             prod.category?.id || 
                             prod.section_id || 
                             '';

            const image = prod.image || prod.img || prod.thumbnail || '';
            
            return {
                id: prod.id,
                name: String(name),
                price: Number(price),
                category_name: String(categoryName),
                category_id: categoryId,
                image: String(image)
            };
        });

        console.log(`API_DEBUG -> Successfully mapped ${formattedProducts.length} products with category extraction.`);

        return NextResponse.json(formattedProducts);

    } catch (error: any) {
        console.error("Products API Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.name === 'AbortError' ? "انتهت مهلة الاتصال بالرغم من الانتظار" : "تعذر الوصول للسيرفر حالياً" 
        }, { status: 200 });
    }
}
