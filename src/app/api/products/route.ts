import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview محرك "رادار شبيك لبيك" V30 - النسخة النهائية الصارمة.
 * يقوم بمسح ذري شامل لكافة طبقات الـ JSON القادمة من الراغب.
 * يسحب المنتجات، المنتجات الفرعية، الخيارات المنسدلة، والكميات العميقة.
 * يضمن ظهور كافة الفئات كاملة عبر نظام التسطيح اللامتناهي.
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

        /**
         * دالة التنقيب الذري: تغوص في أي كائن JSON وتبحث عن المنتجات والخيارات
         */
        function deepScan(obj: any, parentName = '', catInfo = { name: '', id: '' }) {
            if (!obj || typeof obj !== 'object') return;

            // استخراج البيانات الأساسية
            const name = obj.الاسم || obj.name || obj.title || obj.product_name || obj.value || obj.label || '';
            const price = obj.السعر || obj.price || obj.cost || obj.amount || obj.rate || 0;
            const id = obj.id || obj.product_id || obj.service_id || obj.item_id;

            // تحديث معلومات الفئة إذا مررنا بها
            let currentCatName = catInfo.name;
            let currentCatId = catInfo.id;
            
            if (obj.category_name || obj.category?.name || obj.section?.name) {
                currentCatName = obj.category_name || obj.category?.name || obj.section?.name;
                currentCatId = obj.category_id || obj.category?.id || obj.section_id;
            }

            // إذا وجدنا "معرف" وسعر حقيقي (أكبر من 2 ليرة)، نقوم بتخزينه كمنتج
            if (id && Number(price) >= 2 && name) {
                const fullName = parentName && !name.includes(parentName) ? `${parentName} - ${name}` : name;
                allExtractedItems.push({
                    id: id,
                    name: String(fullName),
                    price: Number(price),
                    category_name: String(currentCatName || parentName || ''),
                    category_id: currentCatId,
                    image: obj.image || obj.img || obj.thumbnail || ''
                });
            }

            // البحث عن مصفوفات فرعية (خيارات منسدلة أو فئات فرعية) والغوص داخلها لفكها
            const keysToScan = ['variants', 'options', 'prices', 'sub_services', 'items', 'products', 'data', 'services', 'children', 'quantities'];
            
            if (Array.isArray(obj)) {
                obj.forEach(item => deepScan(item, parentName, { name: currentCatName, id: currentCatId }));
            } else {
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (keysToScan.includes(key) && Array.isArray(value)) {
                        // إذا كان لدينا اسم حالي، نمرره كأب للخيارات المكتشفة بالداخل
                        const newParentName = (id && name) ? name : parentName;
                        value.forEach(item => deepScan(item, newParentName, { name: currentCatName, id: currentCatId }));
                    } else if (typeof value === 'object') {
                        deepScan(value, parentName, { name: currentCatName, id: currentCatId });
                    }
                });
            }
        }

        // بدء عملية التنقيب الشاملة
        deepScan(rawData);

        // تنظيف البيانات: إزالة التكرار وضمان الجودة
        const uniqueProducts = Array.from(new Map(allExtractedItems.map(item => [String(item.id) + String(item.price), item])).values());

        console.log(`API_DEBUG -> Atomic Scan V30: Extracted ${uniqueProducts.length} unique items.`);

        return NextResponse.json(uniqueProducts);

    } catch (error: any) {
        console.error("Products API Critical Failure:", error.message);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 200 });
    }
}
