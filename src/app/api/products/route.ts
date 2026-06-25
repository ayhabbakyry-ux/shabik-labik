import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// قاموس ترجمة أخطاء الراغب الرسمية
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
    // التوكن الصريح لضمان العمل الفوري
    const HARDCODED_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";
    const ALRAGHEB_API_URL = "https://alragheb-store.com/client/api/products";

    try {
        const response = await fetch(ALRAGHEB_API_URL, {
            method: 'GET',
            headers: {
                'api-token': HARDCODED_TOKEN.trim(),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const textData = await response.text();
        
        if (!response.ok) {
            return NextResponse.json({ error: `سيرفر الراغب أرجع خطأ ${response.status}` }, { status: response.status });
        }

        if (!textData || textData.trim() === "") {
            return NextResponse.json([]);
        }

        try {
            const data = JSON.parse(textData);

            // التحقق من وجود كود خطأ داخل الرد
            if (data && data.status && ALRAGHEB_ERRORS[data.status]) {
                return NextResponse.json({ error: ALRAGHEB_ERRORS[data.status], code: data.status }, { status: 400 });
            }

            // استخراج مصفوفة المنتجات
            const productsArray = data.data || data.products || (Array.isArray(data) ? data : []);
            return NextResponse.json(productsArray);
        } catch (parseError) {
            return NextResponse.json({ 
                error: "الرد المستلم ليس JSON صحيح. الرد الخام: " + textData.substring(0, 200) 
            }, { status: 400 });
        }

    } catch (error: any) {
        return NextResponse.json(
            { error: 'حدث خطأ في الاتصال بالسيرفر: ' + error.message }, 
            { status: 500 }
        );
    }
}
