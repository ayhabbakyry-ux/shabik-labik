
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن الحقيقي المحدث لمعالجة الردود العربية من سيرفر الراغب.
 */
export async function POST(request: Request) {
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;
        const qty = 1;

        // بناء الرابط الديناميكي وفق التوثيق الرسمي
        const ENDPOINT = `https://api.alragheb-store.com/client/api/newOrder/${product_id}/params?qty=${qty}&playerId=${playerId}&order_uuid=${order_uuid}`;

        console.log("Initiating request to Al-Ragheb:", ENDPOINT);

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
        
        // طباعة الرد الفعلي للمراقبة في الـ Terminal
        console.log("Al-Ragheb Server Raw Response:", JSON.stringify(data));

        /**
         * التحقق من النجاح بناءً على توثيق الراغب المحدث:
         * 1. الحالة: "موافق"
         * 2. الحالة: "القبول"
         * 3. status: 1
         */
        const isSuccess = 
            data.status === 1 || 
            data.status === 200 || 
            data.success === true || 
            data["الحالة"] === "موافق" || 
            data["الحالة"] === "القبول" ||
            data["status"] === "success";

        if (!isSuccess) {
            const errorCodes: Record<number, string> = {
                100: "رصيد المتجر غير كافٍ.",
                101: "المنتج غير متوفر حالياً.",
                107: "ID اللاعب غير صحيح.",
                108: "يوجد طلب قيد المعالجة حالياً.",
                121: "خطأ في التوكن."
            };

            return NextResponse.json({ 
                success: false, 
                message: errorCodes[data.status] || data.message || data["الرسالة"] || "فشل تنفيذ الطلب من قبل المزود."
            });
        }

        // إرجاع نجاح حقيقي للواجهة الأمامية
        return NextResponse.json({ 
            success: true, 
            message: 'تم الشحن بنجاح!', 
            order_id: data.order_id || data.id || order_uuid,
            raw_data: data
        });

    } catch (error: any) {
        console.error("Orders API Critical Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
