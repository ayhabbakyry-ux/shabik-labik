import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار جلب المنتجات المطور V22 - محرك "الربط العميق".
 * يقوم بتمشيط كافة طبقات الـ JSON لسحب المنتجات من المصفوفات المتداخلة والأقسام.
 * يضمن ظهور كافة الكميات (مثل 12، 15، 25 ليرة) عبر تسطيح البيانات (Flattening).
 */
export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products?limit=500';

    if (!API_TOKEN) {
        return NextResponse.json({ success: false, error: "التوكن مفقود في إعدادات السيرفر" }, { status: 200 });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

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
            return NextResponse.json({ success: false, error: `خطأ اتصال: ${response.status}` }, { status: 200 });
        }

        const rawData = await response.json();
        
        // --- محرك الاستخراج العميق (Deep Extraction Engine) ---
        let allItems: any[] = [];

        /**
         * دالة ذكية لتسطيح البيانات: تبحث عن أي مصفوفة منتجات مهما كان عمقها
         */
        const extractProductsRecursively = (obj: any, parentCategoryName = '', parentCategoryId = '') => {
            if (!obj || typeof obj !== 'object') return;

            // إذا وجدنا مصفوفة، نفحص محتواها
            if (Array.isArray(obj)) {
                obj.forEach(item => {
                    if (item && typeof item === 'object') {
                        // إذا كان العنصر يبدو كمنتج (يحتوي على اسم وسعر أو ID)
                        if (item.id || item.product_id || item.service_id) {
                            // إضافة بيانات الفئة من الأب إذا لم تكن موجودة في العنصر نفسه
                            const formattedItem = {
                                ...item,
                                inherited_category_name: parentCategoryName,
                                inherited_category_id: parentCategoryId
                            };
                            allItems.push(formattedItem);
                        } else {
                            // إذا كانت مصفوفة من فئات، نغوص داخلها
                            extractProductsRecursively(item, parentCategoryName, parentCategoryId);
                        }
                    }
                });
                return;
            }

            // إذا كان كائناً (Object)، نبحث في مفاتيحه
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                
                // تحديث اسم الفئة إذا كنا نمر عبر حقل فئة
                let currentCatName = parentCategoryName;
                let currentCatId = parentCategoryId;

                if (key === 'category' || key === 'section' || key === 'group') {
                    currentCatName = value?.name || value?.title || currentCatName;
                    currentCatId = value?.id || currentCatId;
                }

                // غوص عميق في القيمة
                if (typeof value === 'object') {
                    extractProductsRecursively(value, currentCatName, currentCatId);
                }
            });
        };

        // بدء عملية المسح الشامل للبيانات الخام
        extractProductsRecursively(rawData);

        // إذا فشل المسح الشامل، نحاول الطريقة التقليدية كخطة بديلة
        if (allItems.length === 0) {
            const possibleArrays = [rawData.data, rawData.products, rawData.items, rawData.services];
            for (const arr of possibleArrays) {
                if (Array.isArray(arr)) {
                    allItems = arr;
                    break;
                }
            }
        }

        // تحويل وتنسيق البيانات للواجهة مع حماية Optional Chaining
        const formattedProducts = allItems.map((prod: any) => {
            const name = prod.الاسم || prod.name || prod.title || prod.product_name || 'منتج غير مسمى';
            const price = prod.السعر || prod.price || prod.cost || 0;
            
            // استخراج اسم الفئة بأعلى دقة ممكنة (دعم طلب أيهم الصارم للـ Optional Chaining)
            const categoryName = prod.inherited_category_name || 
                               prod.اسم_الفئة || 
                               prod.category_name || 
                               prod.category?.name || 
                               prod.section?.name || 
                               prod.group_name || 
                               '';
                               
            const categoryId = prod.inherited_category_id ||
                             prod.category_id || 
                             prod.parent_id || 
                             prod.category?.id || 
                             prod.section_id || 
                             '';

            const image = prod.image || prod.img || prod.thumbnail || '';
            
            return {
                id: prod.id || prod.product_id || prod.service_id,
                name: String(name),
                price: Number(price),
                category_name: String(categoryName),
                category_id: categoryId,
                image: String(image)
            };
        });

        // إزالة التكرار (في حال سحبنا نفس المنتج من مكانين مختلفين)
        const uniqueProducts = Array.from(new Map(formattedProducts.map(item => [item.id, item])).values());

        console.log(`API_DEBUG -> Successfully Flattened ${uniqueProducts.length} unique items.`);

        return NextResponse.json(uniqueProducts);

    } catch (error: any) {
        console.error("Products API Critical Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.name === 'AbortError' ? "انتهت مهلة الاتصال" : "تعذر استلام كافة الفئات حالياً" 
        }, { status: 200 });
    }
}
