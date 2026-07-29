import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview محرك "رادار شبيك لبيك" المطور - نسخة الاختراق الذري V23.
 * يقوم بمسح شامل ويستخرج الأسماء من كافة المفاتيح لضمان التقاط فئات الفري فاير المختبئة.
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

        // المفاتيح التي نعتبرها أسماء أقسام إذا احتوت على كلمات دلالية
        const gameKeywords = ['fire', 'fier', 'pubg', 'tiktok', 'bigo', 'likee', 'clash', 'royale', 'pool', 'units', 'سيريتل', 'mtn'];

        /**
         * دالة التنقيب الذري: تخترق كافة الطبقات وتلتقط الهوية من المفاتيح والأسماء.
         */
        function deepScan(obj: any, parentName = '', catInfo = { name: '', id: '' }) {
            if (!obj || typeof obj !== 'object') return;

            const name = obj.الاسم || obj.name || obj.title || obj.product_name || obj.value || obj.label || '';
            const price = obj.السعر || obj.price || obj.cost || obj.amount || obj.rate || 0;
            const id = obj.id || obj.product_id || obj.service_id || obj.item_id;

            const rawStatus = obj.status !== undefined ? obj.status : (obj.active !== undefined ? obj.active : (obj.available !== undefined ? obj.available : 1));
            const isAvailable = (rawStatus === 1 || rawStatus === true || String(rawStatus).toLowerCase() === 'active' || String(rawStatus).toLowerCase() === 'available' || String(rawStatus) === '1' || String(rawStatus) === 'موافق' || String(rawStatus) === 'مكتمل' || String(rawStatus) === 'قبول');

            let currentCatName = catInfo.name;
            let currentCatId = catInfo.id;
            
            // تحديث اسم القسم إذا وجد
            const detectedCatName = obj.category_name || obj.category?.name || obj.section?.name || (id && name && !price ? name : "");
            if (detectedCatName) {
                currentCatName = currentCatName ? `${currentCatName} > ${detectedCatName}` : detectedCatName;
                currentCatId = obj.category_id || obj.category?.id || obj.section_id || currentCatId;
            }

            // إذا وجدنا منتجاً حقيقياً (ID وسعر)
            if (id && Number(price) >= 10 && name) {
                const fullName = parentName && !name.includes(parentName) ? `${parentName} - ${name}` : name;
                allExtractedItems.push({
                    id: id,
                    name: String(fullName),
                    price: Number(price),
                    category_name: String(currentCatName || parentName || ''),
                    category_id: currentCatId,
                    image: obj.image || obj.img || obj.thumbnail || '',
                    available: isAvailable
                });
            }

            // التنقيب في العمق
            if (Array.isArray(obj)) {
                obj.forEach(item => deepScan(item, parentName, { name: currentCatName, id: currentCatId }));
            } else {
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (value && typeof value === 'object') {
                        let nextCatName = currentCatName;
                        const lowerKey = key.toLowerCase();
                        
                        // التقاط اسم القسم من مفاتيح الـ JSON (مثل FREE FIER)
                        const isGameKey = gameKeywords.some(kw => lowerKey.includes(kw));
                        if (isGameKey && isNaN(Number(key))) {
                            nextCatName = nextCatName ? `${nextCatName} > ${key.toUpperCase()}` : key.toUpperCase();
                        }

                        const newParentName = (id && name) ? name : parentName;
                        deepScan(value, newParentName, { name: nextCatName, id: currentCatId });
                    }
                });
            }
        }

        deepScan(rawData);

        // إزالة التكرار
        const uniqueProducts = Array.from(new Map(allExtractedItems.map(item => [String(item.id) + String(item.price), item])).values());
        return NextResponse.json(uniqueProducts);

    } catch (error: any) {
        console.error("Products API Critical Failure:", error.message);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 200 });
    }
}
