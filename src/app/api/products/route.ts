import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار جلب المنتجات المطور - مع نظام معالجة أخطاء متقدم لمنع الانهيار وضمان ظهور البيانات.
 */
export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products';

    if (!API_TOKEN) {
        console.error("API Error: Missing ALRAGHEB_TOKEN");
        return NextResponse.json({ success: false, error: "التوكن مفقود في إعدادات السيرفر" }, { status: 200 });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // مهلة 10 ثوانٍ

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
            return NextResponse.json({ success: false, error: `فشل الاتصال: ${response.status}` }, { status: 200 });
        }

        const rawData = await response.json();
        
        let productsArray = [];
        if (Array.isArray(rawData)) {
            productsArray = rawData;
        } else if (rawData && typeof rawData === 'object') {
            if (rawData.data && Array.isArray(rawData.data)) {
                productsArray = rawData.data;
            } else {
                const possibleKey = Object.keys(rawData).find(key => Array.isArray(rawData[key]));
                productsArray = possibleKey ? rawData[possibleKey] : [];
            }
        }

        const formattedProducts = productsArray.map((prod: any) => {
            const name = prod.الاسم || prod.name || prod.title || prod.product_name || 'منتج غير مسمى';
            const price = prod.السعر || prod.price || prod.cost || 0;
            const categoryName = prod.اسم_الفئة || prod.category_name || prod.category?.name || '';
            const categoryId = prod.category_id || prod.parent_id || '';
            const image = prod.image || prod.img || '';
            
            return {
                id: prod.id,
                name: String(name),
                price: Number(price),
                category_name: String(categoryName),
                category_id: categoryId,
                image: String(image)
            };
        });

        return NextResponse.json(formattedProducts);

    } catch (error: any) {
        console.error("Products API Crash:", error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.name === 'AbortError' ? "انتهت مهلة الاتصال بالسيرفر" : "خطأ في معالجة البيانات" 
        }, { status: 200 });
    }
}
