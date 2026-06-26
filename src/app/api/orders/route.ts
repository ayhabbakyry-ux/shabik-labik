
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن المطور لدعم حالات القبول والانتظار بدقة.
 */
export async function POST(request: Request) {
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;
        const qty = 1;

        // بناء الرابط الديناميكي حسب التوثيق الرسمي
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
        console.log("Raw API Response:", JSON.stringify(data));

        // استخراج الحالة والرسالة من الرد (يدعم المفاتيح العربية والإنجليزية)
        const statusText = data["الحالة"] || data.status_text || data.status || "";
        const message = data["الرسالة"] || data.message || "";
        
        // الشرط المطلوب: النجاح هو (مقبول أو موافق أو انتظار أو القبول)
        const isAccepted = statusText === "مقبول" || statusText === "موافق" || statusText === "القبول";
        const isWaiting = statusText === "انتظار" || statusText === "معالجة" || message.includes("انتظار");
        
        // تحقق النجاح بناءً على طلبك الصريح
        if (isAccepted || isWaiting) {
            return NextResponse.json({ 
                success: true, 
                status_type: isWaiting ? 'pending' : 'completed',
                message: isWaiting ? 'تم استلام الطلب بنجاح وهو قيد المعالجة' : 'تم الشحن بنجاح!', 
                order_id: data.order_id || data.id || order_uuid,
                raw_status: statusText
            });
        }

        // في حال الفشل
        return NextResponse.json({ 
            success: false, 
            message: message || "فشل تنفيذ الطلب من قبل المزود (الحالة غير معروفة)."
        });

    } catch (error: any) {
        console.error("Order API Crash:", error);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
