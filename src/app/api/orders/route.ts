
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;

        const response = await fetch('https://alragheb-store.com', {
            method: 'POST',
            headers: {
                'api-token': '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
        
        // ترجمة رموز أخطاء الطلبات الرسمية من متجر الراغب
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
        console.error('Order Shipment Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'فشل الاتصال بسيرفر الشحن التلقائي.' 
        }, { status: 500 });
    }
}
