import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار فحص الطلبات - يعتمد كلياً على متغيرات البيئة للأمان.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;

    if (!API_TOKEN) {
        return NextResponse.json({ success: false, message: 'إعدادات الأمان مفقودة (API Token)' });
    }

    if (!orderId) {
        return NextResponse.json({ success: false, message: 'رقم الطلب مفقود' });
    }

    try {
        const ENDPOINT = `https://api.alragheb-store.com/client/api/check?orders=${orderId}`;

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });

        const rawData = await response.json();
        const orderList = rawData.data || [];
        const orderInfo = orderList.length > 0 ? orderList[0] : null;

        if (!orderInfo) {
            return NextResponse.json({ success: false, message: 'لم يتم العثور على بيانات الطلب' });
        }

        const remoteStatus = orderInfo.status || orderInfo["الحالة"] || 'wait';

        return NextResponse.json({
            success: true,
            order_id: orderId,
            status: remoteStatus,
            raw: orderInfo
        });

    } catch (error: any) {
        console.error("Check Order API Error:", error);
        return NextResponse.json({ success: false, message: 'خطأ في فحص حالة الطلب' });
    }
}
