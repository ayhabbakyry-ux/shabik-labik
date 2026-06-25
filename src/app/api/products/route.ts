
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار الربط المطور بناءً على التوثيق الرسمي لمتجر الراغب.
 * - يتم إرسال التوكن في حقل api-token.
 * - يتم إرجاع حالة 200 دائماً لتجنب 502 والسماح بقراءة أخطاء المزود (120، 121، إلخ).
 */

export async function GET() {
    // ==========================================
    // ⚠️ تنبيه: ضع التوكن الخاص بك في المتغير أدناه ⚠️
    // ==========================================
    const API_TOKEN = process.env.ALRAGHEB_TOKEN || '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';
    
    // الرابط الرسمي من التوثيق
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products';

    try {
        console.log("Connecting to Al-Ragheb API via official endpoint...");

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN, // الترويسة المطلوبة في التوثيق
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        // إذا كان هناك خطأ من السيرفر (مثل 401 أو 403)
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: "فشل السيرفر في إرجاع JSON صالح" };
            }
            
            console.error(`API Error from Provider: ${response.status}`, errorData);
            
            // نرجع 200 لتجنب انهيار التطبيق (502) ولنتمكن من عرض رمز الخطأ في الواجهة
            return NextResponse.json({ 
                success: false, 
                error: errorData,
                status_code: response.status 
            }, { status: 200 });
        }

        // معالجة البيانات الناجحة
        const data = await response.json();
        console.log("API Response received successfully.");

        // استخراج المنتجات (نتوقع مصفوفة بناءً على التوثيق)
        const productsArray = Array.isArray(data) ? data : (data.products || data.data || []);
        
        // تنظيف وتنسيق الحقول لتناسب الواجهة العربية
        const formattedProducts = productsArray.map((prod: any) => ({
            id: prod.id,
            name: prod.الاسم || prod.name || prod.title || 'منتج غير مسمى',
            price: prod.السعر || prod.price || 0,
            category_name: prod.اسم_الفئة || prod.category_name || '',
            category_id: prod.category_id || prod.parent_id,
            image: prod.image || prod.category_img || ''
        }));

        return NextResponse.json(formattedProducts);

    } catch (error: any) {
        console.error('Fatal API Route Crash:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: "حدث انهيار داخلي في الاتصال بالسيرفر.",
            details: error.message
        }, { status: 200 }); // نرجع 200 حتى في الانهيار الداخلي لسهولة التصحيح
    }
}
