
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن المطور لدعم حالات الانتظار واستخراج رقم الطلب.
 */
export async function POST(request: Request) {
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    try {
        const body = await request.json();
        const { product_id, playerId, order_uuid } = body;
        const qty = 1;

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

        const statusText = data["الحالة"] || data.status_text || "";
        
        // التحقق من النجاح أو الانتظار
        const isAccepted = statusText === "القبول" || statusText === "موافق";
        const isWaiting = statusText === "انتظار";
        const isSuccess = data.status === 1 || data.status === 200 || data.success === true || isAccepted || isWaiting;

        if (!isSuccess) {
            return NextResponse.json({ 
                success: false, 
                message: data.message || data["الرسالة"] || "فشل تنفيذ الطلب من قبل المزود."
            });
        }

        return NextResponse.json({ 
            success: true, 
            status_type: isWaiting ? 'pending' : 'completed',
            message: isWaiting ? 'تم إرسال الطلب بنجاح وهو قيد التنفيذ' : 'تم الشحن بنجاح!', 
            order_id: data.order_id || data.id || order_uuid,
            raw_status: statusText
        });

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
