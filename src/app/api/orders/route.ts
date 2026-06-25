
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن الحقيقي المحدث بالمسار الديناميكي وفق توثيق الراغب.
 */
export async function POST(request: Request) {
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;
        const qty = 1; // الافتراضي لطلب منتج واحد

        // بناء الرابط الديناميكي وفق التوثيق الرسمي
        const ENDPOINT = `https://api.alragheb-store.com/client/api/newOrder/${product_id}/params?qty=${qty}&playerId=${playerId}&order_uuid=${order_uuid}`;

        // الاتصال الحقيقي بسيرفر المزود باستخدام الترويسات والمسار الصحيح
        const response = await fetch(ENDPOINT, {
            method: 'GET', // التوثيق الذي يحتوي على بارامترات في الرابط غالباً ما يستخدم GET
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const data = await response.json();

        // رموز الخطأ المحددة من توثيق الراغب
        const errorCodes: Record<number, string> = {
            100: "رصيد المتجر غير كافٍ لإتمام العملية.",
            101: "هذا المنتج غير متوفر في مخزون المزود حالياً.",
            107: "معرف اللاعب (ID) المدخل غير صحيح أو غير موجود.",
            108: "يوجد طلب شحن قيد المعالجة لهذا المعرف، جرب لاحقاً.",
            121: "خطأ في توكن الاتصال، يرجى مراجعة الإدارة.",
            401: "غير مصرح بالوصول، التوكن قديم أو خاطئ."
        };

        // التحقق من النجاح (status: 1 أو النجاح المباشر)
        const isSuccess = data.status === 1 || data.status === 200 || data.success === true;

        if (!isSuccess) {
            return NextResponse.json({ 
                success: false, 
                message: errorCodes[data.status] || data.message || `فشل الطلب: رمز الخطأ ${data.status}`
            });
        }

        // نجاح حقيقي مع إرجاع معرف الطلب
        return NextResponse.json({ 
            success: true, 
            message: 'تم الشحن بنجاح!', 
            order_id: data.order_id || data.id || order_uuid 
        });

    } catch (error: any) {
        console.error("Orders API Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن (Check Console for details).' 
        }, { status: 200 });
    }
}
