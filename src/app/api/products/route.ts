import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview محرك "رادار شبيك لبيك" المطور - نسخة الاختراق الذري V24.
 * يقوم بمسح شامل ويستخرج الأسماء من كافة المفاتيح لضمان التقاط فئات الفري فاير المختبئة وتوريث الهوية.
 */
export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products?limit=500';

    if (!API_TOKEN) {
        return NextResponse.json({ success: false, error: "API Token Missing" }, { status: 200 });
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
            return NextResponse.json({ success: false, error: `Connection Error: ${response.status}` }, { status: 200 });
        }

        const rawData = await response.json();
        let allExtractedItems: any[] = [];

        // الكلمات المفتاحية للهوية
        const gameKeywords = ['fire', 'fier', 'pubg', 'tiktok', 'bigo', 'likee', 'clash', 'royale', 'pool', 'units', 'سيريتل', 'mtn', 'diamond', 'جواهر'];

        /**
         * دالة التنقيب الذري: تخترق كافة الطبقات وتلتقط الهوية من المفاتيح والأسماء.
         */
        function deepScan(obj: any, inheritedContext = '', parentName = '') {
            if (!obj || typeof obj !== 'object') return;

            // استخراج البيانات الأساسية
            const name = obj.الاسم || obj.name || obj.title || obj.product_name || obj.value || obj.label || '';
            const price = obj.السعر || obj.price || obj.cost || obj.amount || obj.rate || 0;
            const id = obj.id || obj.product_id || obj.service_id || obj.item_id;

            // تحديد الحالة
            const rawStatus = obj.status !== undefined ? obj.status : (obj.active !== undefined ? obj.active : (obj.available !== undefined ? obj.available : 1));
            const isAvailable = (rawStatus === 1 || rawStatus === true || String(rawStatus).toLowerCase() === 'active' || String(rawStatus).toLowerCase() === 'available' || String(rawStatus) === '1' || String(rawStatus) === 'موافق' || String(rawStatus) === 'مكتمل' || String(rawStatus) === 'قبول');

            // التقاط الهوية من المفتاح أو الاسم
            let currentContext = inheritedContext;
            const detectedCatName = obj.category_name || obj.category?.name || obj.section?.name || (id && name && !price ? name : "");
            if (detectedCatName) {
                const lowerCat = detectedCatName.toLowerCase();
                if (lowerCat.includes('fire') || lowerCat.includes('fier') || lowerCat.includes('فري فاير')) {
                    currentContext = 'FREE FIRE';
                } else if (lowerCat.includes('pubg') || lowerCat.includes('ببجي')) {
                    currentContext = 'PUBG';
                }
            }

            // إذا وجدنا منتجاً حقيقياً (ID وسعر واسم)
            if (id && Number(price) >= 10 && name) {
                // توريث اسم اللعبة إذا كان المنتج بداخلها
                const finalCategory = currentContext || detectedCatName || parentName || '';
                
                allExtractedItems.push({
                    id: id,
                    name: String(name),
                    price: Number(price),
                    category_name: String(finalCategory),
                    category_id: obj.category_id || obj.category?.id || '',
                    image: obj.image || obj.img || obj.thumbnail || '',
                    available: isAvailable
                });
            }

            // التنقيب في العمق مع توريث السياق
            if (Array.isArray(obj)) {
                obj.forEach(item => deepScan(item, currentContext, name || parentName));
            } else {
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (value && typeof value === 'object') {
                        let nextContext = currentContext;
                        const lowerKey = key.toLowerCase();
                        
                        // التقاط الهوية من مفاتيح الـ JSON
                        if (lowerKey.includes('fire') || lowerKey.includes('fier')) {
                            nextContext = 'FREE FIRE';
                        } else if (lowerKey.includes('pubg')) {
                            nextContext = 'PUBG';
                        }

                        deepScan(value, nextContext, (id && name) ? name : parentName);
                    }
                });
            }
        }

        deepScan(rawData);

        // إزالة التكرار (ID + السعر)
        const uniqueProducts = Array.from(new Map(allExtractedItems.map(item => [String(item.id) + String(item.price), item])).values());
        return NextResponse.json(uniqueProducts);

    } catch (error: any) {
        console.error("Products API Critical Failure:", error.message);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 200 });
    }
}
