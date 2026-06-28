import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن الذكي مع معالجة الهيكلية العميقة الصارمة.
 * يضمن عدم إظهار خطأ إذا كان الرد الخارجي "موافق"، ويفحص الحالة الداخلية بدقة.
 */
export async function POST(request: Request) {
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;
        const qty = 1;

        const ENDPOINT = `https://api.alragheb-store.com/client/api/newOrder/${product_id}/params?qty=${qty}&playerId=${playerId}&order_uuid=${order_uuid}`;

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const data = await response.json() as any;
        
        // تسجيل الرد الكامل للمراقبة
        console.log('Alragheb API Raw Response:', JSON.stringify(data));

        // استخراج الحالات من الهيكلية العميقة مع التحويل لنصوص لتجنب أخطاء النوع
        const outerStatus = String(data["الحالة"] || "");
        const innerData = data["بيانات"];
        const innerStatus = innerData ? String(innerData["الحالة"] || "") : "";
        const message = String(data["الرسالة"] || "");
        
        console.log(`Final Decision Logic - Outer: [${outerStatus}] | Inner: [${innerStatus}]`);

        // المنطق المالي الصارم: إذا كانت الحالة الخارجية موافق، لا نرمي خطأ أبداً
        const statusText = String(innerStatus || outerStatus || "").trim();
    console.log('API_DEBUG -> Final Clean Status:', statusText);

    if (statusText === 'قبول' || statusText === 'موافق' || statusText === 'مكتمل') {
        return NextResponse.json({ success: true, status_type: 'completed', message: 'تم تنفيذ الطلب بنجاح', order_id: data?.order_id || (innerData ? innerData['رقم_الطلب'] : "") });
    } else if (statusText === 'انتظار' || statusText === '') {
        return NextResponse.json({ success: true, status_type: 'pending', message: 'الطلب قيد الانتظار في سيرفر الراغب، تم حجز الرصيد بنجاح', order_id: data?.order_id || (innerData ? innerData['رقم_الطلب'] : "") });
    } else if (statusText === 'رفض') {
        return NextResponse.json({ success: false, message: message || 'تم رفض الطلب من السيرفر وعاد الرصيد' });
    } else {
        return NextResponse.json({ success: true, status_type: 'pending', message: 'جاري معالجة الطلب (حالة: ' + statusText + ')', order_id: data?.order_id || (innerData ? innerData['رقم_الطلب'] : "") });
    }
    
} catch (error: any) {
        console.error("Critical Order API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
