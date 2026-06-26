
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار التحقق من حالة الطلبات من سيرفر الراغب.
 * يستقبل order_id كمعلمة استعلام ويرجع الحالة الخام من السيرفر.
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

        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'فشل الاتصال بسيرفر المزود' });
        }

        const data = await response.json();
        
        // سيرفر الراغب قد يرجع مصفوفة أو كائن مفتاحه هو رقم الطلب
        const orderInfo = Array.isArray(data) ? data[0] : (data[orderId] || data);

        return NextResponse.json({
            success: true,
            order_id: orderId,
            status: orderInfo?.الحالة || orderInfo?.status || 'غير معروف',
            raw: orderInfo
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'خطأ في معالجة طلب الفحص' });
    }
}
