
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن المطور.
 * تم تعديل المنطق ليتوافق مع هيكلية الرد العميقة لسيرفر الراغب:
 * - الحالة الخارجية: data["الحالة"] (عادة تكون 'موافق')
 * - الحالة الداخلية: data["بيانات"]["الحالة"] (القبول، انتظار، إلخ)
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

        const data = await response.json();
        
        // طباعة الرد الخام بالكامل للتدقيق في سجلات Vercel
        console.log('Full Raw Response from Alragheb:', JSON.stringify(data));

        // استخراج الحالات بناءً على التوثيق الجديد
        const outerStatus = String(data["الحالة"] || "");
        const innerData = data["بيانات"];
        const innerStatus = innerData ? String(innerData["الحالة"] || "") : "";
        const message = String(data["الرسالة"] || "");
        
        // الحالة الحقيقية التي سنعتمد عليها هي الداخلية، ونعود للخارجية إذا فقدت
        const actualStatus = innerStatus || outerStatus;

        console.log('Processing Status - Outer:', outerStatus, '| Inner:', innerStatus);

        // فحص النجاح أو الانتظار بناءً على الكلمات المفتاحية الدقيقة
        const isAccepted = actualStatus.includes('القبول') || actualStatus.includes('مقبول') || actualStatus.includes('موافق');
        const isWaiting = actualStatus.includes('انتظار') || actualStatus.includes('ينتظر') || actualStatus.includes('معالجة');
        const isMsgSuccess = message.includes('بنجاح') || message.includes('استلام');

        if (isAccepted || isWaiting || isMsgSuccess) {
            const finalStatusType = isWaiting ? 'pending' : 'completed';
            
            return NextResponse.json({ 
                success: true, 
                status_type: finalStatusType,
                message: isWaiting ? 'تم استلام الطلب بنجاح وهو قيد المعالجة' : 'تمت العملية بنجاح!', 
                order_id: data.order_id || (innerData && innerData.id) || order_uuid,
                raw_status: actualStatus
            });
        }

        // فشل حقيقي
        return NextResponse.json({ 
            success: false, 
            message: message || `فشل التنفيذ. الحالة: ${actualStatus}`,
            raw_status: actualStatus
        });

    } catch (error: any) {
        console.error("Critical Order API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
