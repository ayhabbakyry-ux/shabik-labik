import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview محرك "رادار شبيك لبيك" المطور - النسخة الشاملة للاختراق العميقة.
 * يقوم بمسح ذري شامل ويستخرج حالة التوفر (Status) وكامل مسار الفئات لضمان جودة البيانات.
 * التحديث: التقاط أسماء الأقسام من المفاتيح (Object Keys) لضمان عدم ضياع فئات مثل FREE FIER.
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

        // مفاتيح النظام التي يجب تجاهلها عند البحث عن أسماء الأقسام في المفاتيح
        const keysToScan = ['variants', 'options', 'prices', 'sub_services', 'items', 'products', 'data', 'services', 'children', 'quantities', 'sub_categories', 'sections', 'categories'];

        /**
         * دالة التنقيب الذري: تغوص في أي كائن JSON وتبحث عن المنتجات والخيارات مع حفظ مسار الفئة وحالة التوفر
         */
        function deepScan(obj: any, parentName = '', catInfo = { name: '', id: '' }) {
            if (!obj || typeof obj !== 'object') return;

            // استخراج البيانات الأساسية
            const name = obj.الاسم || obj.name || obj.title || obj.product_name || obj.value || obj.label || '';
            const price = obj.السعر || obj.price || obj.cost || obj.amount || obj.rate || 0;
            const id = obj.id || obj.product_id || obj.service_id || obj.item_id;

            // كشف حالة التوفر (Status) بدقة
            const rawStatus = obj.status !== undefined ? obj.status : (obj.active !== undefined ? obj.active : (obj.available !== undefined ? obj.available : 1));
            const isAvailable = (rawStatus === 1 || rawStatus === true || String(rawStatus).toLowerCase() === 'active' || String(rawStatus).toLowerCase() === 'available' || String(rawStatus) === '1');

            // تحديث معلومات الفئة بشكل تراكمي لضمان عدم ضياع السياق
            let currentCatName = catInfo.name;
            let currentCatId = catInfo.id;
            
            const detectedCatName = obj.category_name || obj.category?.name || obj.section?.name || (id && name && !price ? name : "");
            if (detectedCatName) {
                currentCatName = currentCatName ? `${currentCatName} > ${detectedCatName}` : detectedCatName;
                currentCatId = obj.category_id || obj.category?.id || obj.section_id || currentCatId;
            }

            // نظام الفلترة الصارم: استبعاد المنتجات الوهمية (أقل من 10 ليرات)
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

            // البحث عن مصفوفات فرعية (خيارات منسدلة أو فئات فرعية) والغوص داخلها لفكها
            if (Array.isArray(obj)) {
                obj.forEach(item => deepScan(item, parentName, { name: currentCatName, id: currentCatId }));
            } else {
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (value && typeof value === 'object') {
                        // تطوير: التقاط أسماء الأقسام من المفاتيح إذا لم تكن كلمات تقنية (مثل FREE FIER)
                        let nextCatName = currentCatName;
                        if (!keysToScan.includes(key) && isNaN(Number(key)) && key.length > 2) {
                            nextCatName = nextCatName ? `${nextCatName} > ${key}` : key;
                        }
                        const newParentName = (id && name) ? name : parentName;
                        deepScan(value, newParentName, { name: nextCatName, id: currentCatId });
                    }
                });
            }
        }

        deepScan(rawData);

        // تنظيف البيانات: إزالة التكرار وضمان الجودة
        const uniqueProducts = Array.from(new Map(allExtractedItems.map(item => [String(item.id) + String(item.price), item])).values());

        return NextResponse.json(uniqueProducts);

    } catch (error: any) {
        console.error("Products API Critical Failure:", error.message);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 200 });
    }
}
