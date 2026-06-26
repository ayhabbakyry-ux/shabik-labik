
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار التحقق من حالة الطلبات من سيرفر الراغب.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const API_TOKEN = '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    if (!orderId) {
        return NextResponse.json({ success: false, message: 'رقم الطلب مفقود' });
    }

    try {
        // بناء رابط التحقق حسب التوثيق
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
        
        // سيرفر الراغب يعيد مصفوفة من الطلبات في حال استخدام ?orders=id1,id2
        // أو كائن واحد إذا كان طلباً واحداً. سنقوم بمعالجة النتيجة.
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'خطأ في الاتصال بسيرفر التحقق' });
    }
}
