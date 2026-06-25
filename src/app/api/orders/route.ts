
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن الحقيقي المتصل بسيرفر الراغب.
 */
export async function POST(request: Request) {
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/order/create';

    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;

        // الاتصال الحقيقي بسيرفر المزود
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'api-token': API_TOKEN,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                product_id,
                qty: 1,
                playerId,
                order_uuid
            }),
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

        // التحقق الصارم من النجاح (يجب أن يكون status هو 1 أو 200 حسب السيرفر)
        const isSuccess = data.status === 1 || data.status === 200 || data.success === true;

        if (!isSuccess) {
            return NextResponse.json({ 
                success: false, 
                message: errorCodes[data.status] || data.message || `فشل الطلب: رمز الخطأ ${data.status}`
            });
        }

        // نجاح حقيقي
        return NextResponse.json({ 
            success: true, 
            message: 'تم الشحن بنجاح!', 
            order_id: data.order_id || data.id || order_uuid 
        });

    } catch (error: any) {
        console.error("Orders API Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن التلقائي.' 
        }, { status: 200 }); // نرجع 200 لمنع انهيار الواجهة وعرض رسالة الخطأ
    }
}
