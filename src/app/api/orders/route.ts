import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن المطور للتعامل مع حالات النجاح والانتظار باستخدام الفحص الجزئي للنصوص لضمان الدقة.
 */
export async function POST(request: Request) {
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;
        const qty = 1;

        // بناء الرابط الديناميكي حسب التوثيق
        const ENDPOINT = `https://api.alragheb-store.com/client/api/newOrder/${product_id}/params?qty=${qty}&playerId=${playerId}&order_uuid=${order_uuid}`;

        console.log("Requesting Al-Ragheb API:", ENDPOINT);

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const data = await response.json();
        
        // طباعة الرد بالكامل في سجلات السيرفر للتحقق
        console.log('Raw API Response from Alragheb:', JSON.stringify(data));

        // استخراج الحالة والرسالة وتحويلهما لنصوص
        const statusValue = String(data["الحالة"] || data.status_text || data.status || "");
        const message = String(data["الرسالة"] || data.message || "");
        
        // طباعة القيمة الدقيقة المطلوبة في سجلات Vercel كما طلبت
        console.log('Value of status is:', statusValue);

        // استخدام الفحص الجزئي (includes) لضمان اكتشاف الكلمات في أي جزء من النص
        // هذا الشرط يغطي: "مقبول", "موافق", "القبول", "انتظار", "معالجة"
        const isAccepted = statusValue.includes('مقبول') || statusValue.includes('موافق') || statusValue.includes('القبول');
        const isWaiting = statusValue.includes('انتظار') || statusValue.includes('معالجة');
        const isMsgSuccess = message.includes('بنجاح') || message.includes('انتظار') || message.includes('مقبول');

        if (isAccepted || isWaiting || isMsgSuccess) {
            const finalIsWaiting = isWaiting || message.includes('انتظار');
            
            return NextResponse.json({ 
                success: true, 
                status_type: finalIsWaiting ? 'pending' : 'completed',
                message: finalIsWaiting ? 'تم استلام الطلب بنجاح وهو قيد المعالجة' : 'تم الشحن بنجاح!', 
                order_id: data.order_id || data.id || order_uuid,
                raw_status: statusValue
            });
        }

        // في حال عدم مطابقة أي حالة نجاح
        return NextResponse.json({ 
            success: false, 
            message: message || `فشل تنفيذ الطلب. الحالة المستلمة: ${statusValue}`,
            raw_status: statusValue
        });

    } catch (error: any) {
        console.error("Order API Crash:", error);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
