import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن الرسمي - متوافق 100% مع وثائق Alragheb Store.
 * يستخدم نظام GET و UUID لمنع التكرار وضمان استقرار الطلب.
 */
export async function POST(request: Request) {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;

    if (!API_TOKEN) {
        return NextResponse.json({ 
            success: false, 
            message: 'خطأ في إعدادات السيرفر (التوكن مفقود).' 
        });
    }

    try {
        const body = await request.json();
        
        // جلب البيانات من الواجهة
        const product_id = body.service || body.product_id;
        const playerId = body.link || body.playerId;
        const qty = body.quantity || body.qty || 1;
        
        // توليد UUID فريد لكل طلب لمنع تكرار العملية في سيرفر الراغب
        const order_uuid = crypto.randomUUID();

        if (!product_id) {
            return NextResponse.json({ success: false, message: 'معرف الخدمة (Service ID) مفقود.' });
        }

        // بناء الرابط الرسمي حسب الوثائق: GET مع معاملات الاستعلام
        const ENDPOINT = `https://api.alragheb-store.com/client/api/newOrder/${product_id}/params?qty=${qty}&playerId=${playerId}&order_uuid=${order_uuid}`;

        console.log('API_DEBUG -> Dispatching GET Request to Alragheb:', ENDPOINT);

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const rawData = await response.json();
        console.log('API_DEBUG -> Alragheb Raw Response:', JSON.stringify(rawData));

        // تحليل استجابة السيرفر بناءً على حالة النجاح
        // سيرفر الراغب قد يرجع status: "OK" أو success: true
        if (rawData.status === "OK" || rawData.success === true || rawData["الحالة"] === "قبول") {
            const orderId = rawData.data?.order_id || rawData.order_id || rawData.data?.['رقم_الطلب'] || "";
            return NextResponse.json({ 
                success: true, 
                status_type: 'pending', 
                message: 'تم استلام الطلب وبانتظار التنفيذ', 
                order_id: orderId 
            });
        } else {
            // معالجة الأخطاء (مثل كود 100 للرصيد، أو رسالة صريحة)
            let errorMsg = rawData.message || rawData.error || 'رفض السيرفر تنفيذ الطلب';
            if (rawData.code === 100) errorMsg = "عذراً، الرصيد غير كافٍ في حساب المزود حالياً.";
            
            return NextResponse.json({ 
                success: false, 
                message: errorMsg 
            });
        }
    
    } catch (error: any) {
        console.error("Critical Order API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن (Timeout or Network Error).' 
        }, { status: 200 });
    }
}
