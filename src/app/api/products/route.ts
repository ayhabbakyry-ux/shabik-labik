
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار الربط الحقيقي مع سيرفر الراغب لخدمات الشحن التلقائي.
 */

export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN || '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    try {
        const response = await fetch('https://alragheb-store.com', {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            cache: 'no-store'
        });

        const textData = await response.text();

        // فحص الرد للتأكد من أنه JSON وليس صفحة حظر HTML
        if (!textData || textData.trim().startsWith('<!doctype') || textData.trim().startsWith('<html')) {
            console.error("CORS or Firewall blockage detected. Returning Fallback.");
            return NextResponse.json(getFallbackData());
        }

        try {
            const data = JSON.parse(textData);
            const productsArray = Array.isArray(data) ? data : (data.products || data.data || []);
            
            if (productsArray.length === 0) return NextResponse.json(getFallbackData());

            // ترجمة الحقول العربية من السيرفر لضمان عمل الواجهة
            const formattedProducts = productsArray.map((prod: any) => ({
                id: prod.id,
                name: prod.الاسم || prod.name || 'منتج غير مسمى',
                price: prod.السعر || prod.price || 0,
                category_name: prod.اسم_الفئة || prod.category_name || '',
                category_id: prod.parent_id !== undefined ? prod.parent_id : prod.category_id,
                image: prod.category_img || prod.image || ''
            }));

            return NextResponse.json(formattedProducts);
        } catch (parseError) {
            console.error("JSON Parsing failed. Returning Fallback.");
            return NextResponse.json(getFallbackData());
        }

    } catch (error) {
        console.error('Connection failed:', error);
        return NextResponse.json(getFallbackData());
    }
}

function getFallbackData() {
    return [
        { "id": 365, "name": "UC 60 ببجي العالمية", "price": 1.10, "category_name": "PUBG", "category_id": "PUBG", "image": "https://picsum.photos/seed/pubg/200/200" },
        { "id": 99, "name": "100 جوهرة فري فاير", "price": 0.95, "category_name": "Free Fire", "category_id": "Free Fire", "image": "https://picsum.photos/seed/ff/200/200" }
    ];
}
