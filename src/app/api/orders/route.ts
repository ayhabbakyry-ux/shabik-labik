
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن المحدث بالتوكن الحقيقي.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;
        
        const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';
        const ENDPOINT = 'https://api.alragheb-store.com/client/api/order/create';

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
        
        const errorCodes: Record<number, string> = {
            100: "عذراً، رصيد متجرنا لدى المزود غير كافٍ حالياً.",
            101: "المنتج غير متوفر حالياً في مخزون المزود.",
            107: "معرف اللاعب (ID) خاطئ أو محظور من قِبل اللعبة.",
            108: "يوجد طلب آخر قيد المعالجة لهذا المعرف، يرجى الانتظار.",
            121: "خطأ في توكن الاتصال بالمزود.",
            123: "عنوان الـ IP الخاص بنا غير مصرح له بالشحن، تواصل مع الإدارة."
        };

        if (data.status && data.status !== 200 && data.status !== 1) {
            return NextResponse.json({ 
                success: false, 
                message: errorCodes[data.status] || data.message || `خطأ غير معروف برقم: ${data.status}`
            });
        }

        return NextResponse.json({ success: true, message: 'تم الشحن بنجاح!', data });

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            message: 'فشل الاتصال بسيرفر الشحن التلقائي.' 
        }, { status: 500 });
    }
}
