import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// قاموس ترجمة أخطاء الراغب الرسمية بناءً على الأكواد
const ALRAGHEB_ERRORS: Record<number, string> = {
    120: "رمز API مطلوب! يرجى التحقق من التوكن.",
    121: "خطأ في الرمز المميز! التوكن الذي تم إدخاله غير صحيح.",
    122: "غير مسموح باستخدام الـ API! يرجى تفعيل صلاحية المطورين من لوحة الراغب.",
    123: "عنوان IP غير مسموح به! يرجى إضافة الـ IP الخاص بموقعنا داخل لوحة تحكم حسابك في الراغب.",
    130: "الموقع قيد الصيانة حالياً من طرف المزود.",
    100: "رصيدك غير كافٍ لإتمام هذه العملية.",
    107: "معرف اللاعب محظور أو غير صحيح."
};

export async function GET() {
    // محاولة جلب التوكن من ملف البيئة أو استخدام التوكن الصريح كخيار احتياطي
    const HARDCODED_TOKEN = process.env.ALRAGHEB_TOKEN || "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";
    const ALRAGHEB_API_URL = "https://alragheb-store.com/client/api/products";

    try {
        const response = await fetch(ALRAGHEB_API_URL, {
            method: 'GET',
            headers: {
                'api-token': HARDCODED_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            cache: 'no-store'
        });

        const textData = await response.text();
        
        if (!response.ok) {
            return NextResponse.json({ 
                error: `سيرفر الراغب أرجع خطأ ${response.status}`, 
                raw: textData.substring(0, 100) 
            }, { status: response.status });
        }

        if (!textData || textData.trim() === "" || textData.trim().startsWith("<!DOCTYPE html>")) {
            console.error("Received HTML or empty response instead of JSON from Alragheb");
            return NextResponse.json([]); 
        }

        try {
            const data = JSON.parse(textData);

            // فحص أكواد الحالة الداخلية من الراغب
            if (data && data.status && ALRAGHEB_ERRORS[data.status]) {
                return NextResponse.json({ 
                    error: ALRAGHEB_ERRORS[data.status], 
                    code: data.status 
                }, { status: 400 });
            }

            // استخراج مصفوفة المنتجات
            const productsArray = data.data || data.products || (Array.isArray(data) ? data : []);
            
            // تحويل الحقول العربية القادمة من الراغب إلى الحقول الإنجليزية التي تفهمها الواجهة
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
            console.error("JSON Parse Error. Data starts with:", textData.substring(0, 100));
            return NextResponse.json({ error: "البيانات المستلمة ليست بصيغة JSON صحيحة" }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Fetch Error:', error.message);
        return NextResponse.json({ error: `خطأ في الاتصال: ${error.message}` }, { status: 500 });
    }
}
