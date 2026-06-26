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
        if (outerStatus.includes('موافق')) {
            
            // فحص الحالة الداخلية (القبول تعني نجاح فوري)
            const isAccepted = innerStatus.includes('القبول') || innerStatus.includes('مقبول');
            // فحص حالة الانتظار
            const isWaiting = innerStatus.includes('انتظار') || innerStatus.includes('ينتظر') || innerStatus.includes('معالجة');
            // فحص رسالة النجاح الاحتياطية
            const isMsgSuccess = message.includes('بنجاح') || message.includes('استلام');

            if (isAccepted || isWaiting || isMsgSuccess) {
                // تحديد نوع الحالة المالية: مكتمل أو معلق (حجز)
                const finalStatusType = (isAccepted || (!isWaiting && isMsgSuccess)) ? 'completed' : 'pending';
                
                return NextResponse.json({ 
                    success: true, 
                    status_type: finalStatusType,
                    message: finalStatusType === 'pending' ? 'تم استلام الطلب وهو قيد المعالجة (انتظار)' : 'تم تنفيذ الطلب بنجاح!', 
                    order_id: data.order_id || (innerData && innerData.id) || order_uuid,
                    raw_status: innerStatus || outerStatus
                });
            }
        }

        // في حال الرفض الصريح أو عدم استيفاء الشروط أعلاه
        return NextResponse.json({ 
            success: false, 
            message: message || `فشل التنفيذ. الحالة: ${innerStatus || outerStatus}`,
            raw_status: innerStatus || outerStatus
        });

    } catch (error: any) {
        console.error("Critical Order API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
