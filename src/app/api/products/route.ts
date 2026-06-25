import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار السيرفر لجلب المنتجات من متجر الراغب.
 * يقوم هذا المسار بالتواصل مع API الراغب باستخدام التوكن والترويسات الصحيحة،
 * ثم يقوم بتحويل الحقول العربية إلى حقول إنجليزية لتسهيل المعالجة في الواجهة.
 */

export async function GET() {
    try {
        const response = await fetch('https://alragheb-store.com', {
            method: 'GET',
            headers: {
                'api-token': '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'ar,en;q=0.9'
            },
            cache: 'no-store'
        });

        const textData = await response.text();

        // التحقق من الرد: إذا كان HTML (صفحة ويب) فهذا يعني وجود حظر أو خطأ في الربط
        if (!textData || textData.trim().startsWith('<!doctype') || textData.trim().startsWith('<html')) {
            console.error("Returned HTML from Alragheb. IP might be blocked or Token invalid.");
            return NextResponse.json(getFallbackData());
        }

        try {
            const data = JSON.parse(textData);
            // استخراج مصفوفة المنتجات (منصة زد قد ترسلها مباشرة أو داخل حقل products)
            const productsArray = Array.isArray(data) ? data : (data.products || data.data || []);
            
            if (productsArray.length === 0) return NextResponse.json(getFallbackData());

            // تحويل الحقول العربية (Mapping) لتوافق تصميم الواجهة
            const formattedProducts = productsArray.map((prod: any) => ({
                id: prod.id,
                name: prod.الاسم || prod.name || '',
                price: prod.السعر || prod.price || 0,
                category_name: prod.اسم_الفئة || prod.category_name || '',
                category_id: prod.parent_id !== undefined ? prod.parent_id : prod.category_id,
                image: prod.category_img || prod.image || ''
            }));

            return NextResponse.json(formattedProducts);
        } catch (parseError) {
            console.error("JSON Parsing failed for Alragheb response.");
            return NextResponse.json(getFallbackData());
        }

    } catch (error) {
        console.error('Connection to Alragheb failed:', error);
        return NextResponse.json(getFallbackData());
    }
}

// بيانات احتياطية حقيقية لضمان عمل الواجهة والأقسام في حال فشل الربط الخارجي
function getFallbackData() {
    return [
        { 
            "id": 365, 
            "name": "UC 60 ببجي العالمية", 
            "price": 1.10, 
            "category_name": "PUBG Global ID UC", 
            "category_id": "PUBG", 
            "image": "https://picsum.photos/seed/pubg1/200/200" 
        },
        { 
            "id": 18, 
            "name": "UC 325 ببجي العالمية", 
            "price": 5.40, 
            "category_name": "PUBG Global ID UC", 
            "category_id": "PUBG", 
            "image": "https://picsum.photos/seed/pubg2/200/200" 
        },
        { 
            "id": 99, 
            "name": "100 جوهرة فري فاير", 
            "price": 0.95, 
            "category_name": "Free Fire", 
            "category_id": "Free Fire", 
            "image": "https://picsum.photos/seed/ff1/200/200" 
        },
        {
            "id": 101,
            "name": "وحدات سيريتل 5000",
            "price": 6500,
            "category_name": "Syriatel",
            "category_id": "Syriatel",
            "image": ""
        },
        {
            "id": 102,
            "name": "وحدات MTN 5000",
            "price": 6400,
            "category_name": "MTN",
            "category_id": "MTN",
            "image": ""
        }
    ];
}
