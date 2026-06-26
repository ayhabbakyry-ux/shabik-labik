
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار التحقق من حالة الطلبات المحدث للتعامل مع الهيكلية العميقة.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

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

        const data = await response.json();
        
        // سيرفر الراغب قد يرجع مصفوفة أو كائن
        const orderInfo = Array.isArray(data) ? data[0] : (data[orderId] || data);

        // استخراج الحالة العميقة
        const status = orderInfo?.["الحالة"] || orderInfo?.status || 'غير معروف';

        return NextResponse.json({
            success: true,
            order_id: orderId,
            status: status,
            raw: orderInfo
        });

    } catch (error: any) {
        console.error("Check Order API Error:", error);
        return NextResponse.json({ success: false, message: 'خطأ في معالجة طلب الفحص' });
    }
}
