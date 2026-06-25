
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار الربط المطور بناءً على التوثيق الرسمي لمتجر الراغب.
 * - التوثيق يشترط إرسال التوكن في حقل: api-token
 * - الرابط الرسمي: https://api.alragheb-store.com/client/api/products
 */

export async function GET() {
    // التوكن الخاص بمتجر الراغب
    const API_TOKEN = process.env.ALRAGHEB_TOKEN || '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';
    
    // الرابط المعتمد من التوثيق الرسمي
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products';

    try {
        console.log("Connecting to Al-Ragheb API via official endpoint...");

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN, // الترويسة المطلوبة في التوثيق حصراً
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        // إذا كان السيرفر أرجع خطأ (مثل 401، 403، 422)
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: "فشل السيرفر في إرجاع استجابة JSON" };
            }
            
            console.error(`API Provider Error (${response.status}):`, errorData);
            
            // نرجع 200 لتجنب انهيار التطبيق (502) ولنتمكن من عرض رمز الخطأ في الواجهة الأمامية
            return NextResponse.json({ 
                success: false, 
                error: errorData,
                status_code: response.status 
            }, { status: 200 });
        }

        const data = await response.json();
        
        // استخراج المصفوفة (التوثيق يرجع مصفوفة مباشرة أو كائن يحتوي على products)
        const productsArray = Array.isArray(data) ? data : (data.products || data.data || []);
        
        // تنظيف وتنسيق البيانات للواجهة العربية
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
        console.error('Fatal API Crash:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: "حدث خطأ في الاتصال الداخلي بسيرفر النشر.",
            details: error.message
        }, { status: 200 });
    }
}
