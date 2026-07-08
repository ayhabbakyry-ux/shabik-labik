import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار جلب المنتجات - يعتمد كلياً على متغيرات البيئة للأمان.
 */
export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products';

    if (!API_TOKEN) {
        return NextResponse.json({ success: false, error: "التوكن مفقود في إعدادات البيئة" }, { status: 200 });
    }

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
            return NextResponse.json({ success: false, error: "فشل الاتصال بسيرفر الراغب" }, { status: 200 });
        }

        const rawData = await response.json();
        
        let productsArray = [];
        if (Array.isArray(rawData)) {
            productsArray = rawData;
        } else if (rawData.data && Array.isArray(rawData.data)) {
            productsArray = rawData.data;
        } else {
            const possibleKey = Object.keys(rawData).find(key => Array.isArray(rawData[key]));
            productsArray = possibleKey ? rawData[possibleKey] : [];
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
        return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }
}
