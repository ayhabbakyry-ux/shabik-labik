
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// بيانات احتياطية حقيقية لضمان عمل الواجهة في حال فشل الربط الخارجي
const FALLBACK_PRODUCTS = [
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

export async function GET() {
    // استخدام التوكن الصريح لضمان أعلى مستويات الاستقرار
    const TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";
    const API_URL = "https://alragheb-store.com/client/api/products";

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'api-token': TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            cache: 'no-store'
        });

        const textData = await response.text();
        
        // التحقق مما إذا كانت الاستجابة HTML أو فارغة
        if (!textData || textData.trim().startsWith("<!DOCTYPE") || !response.ok) {
            console.warn("Alragheb API returned HTML or error. Using Fallback Data.");
            return NextResponse.json(FALLBACK_PRODUCTS);
        }

        try {
            const data = JSON.parse(textData);
            const productsArray = data.data || data.products || (Array.isArray(data) ? data : []);
            
            if (productsArray.length === 0) return NextResponse.json(FALLBACK_PRODUCTS);

            // تحويل الحقول العربية إلى الإنجليزية لضمان التوافق مع الواجهة
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
            console.error("JSON Parse Error. Using Fallback Data.");
            return NextResponse.json(FALLBACK_PRODUCTS);
        }

    } catch (error: any) {
        console.error('Fetch Error. Using Fallback Data:', error.message);
        return NextResponse.json(FALLBACK_PRODUCTS);
    }
}
