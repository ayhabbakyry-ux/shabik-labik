
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار جلب المنتجات المحدث بالتوكن الحقيقي والترويسات الصحيحة.
 */
export async function GET() {
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products';

    try {
        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: "فشل السيرفر في إرجاع استجابة JSON" };
            }
            return NextResponse.json({ 
                success: false, 
                error: errorData,
                status_code: response.status 
            }, { status: 200 });
        }

        const data = await response.json();
        const productsArray = Array.isArray(data) ? data : (data.products || data.data || []);
        
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
        return NextResponse.json({ 
            success: false, 
            error: "حدث خطأ في الاتصال الداخلي بسيرفر النشر.",
            details: error.message
        }, { status: 200 });
    }
}
