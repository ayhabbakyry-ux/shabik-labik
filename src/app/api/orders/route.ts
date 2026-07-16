import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار تنفيذ طلبات الشحن المطور - يدعم الآن الكمية الديناميكية والمفاتيح المرنة.
 */
export async function POST(request: Request) {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;

    if (!API_TOKEN) {
        console.error("API_TOKEN is missing in environment variables");
        return NextResponse.json({ 
            success: false, 
            message: 'خطأ في إعدادات السيرفر (التوكن مفقود).' 
        });
    }

    try {
        const body = await request.json();
        
        // دعم المفاتيح الجديدة والقديمة لضمان عدم الفشل
        const product_id = body.service || body.product_id;
        const playerId = body.link || body.playerId;
        const qty = body.quantity || body.qty || 1;
        const order_uuid = body.order_uuid || crypto.randomUUID();

        if (!product_id) {
            return NextResponse.json({ success: false, message: 'معرف الخدمة (Service ID) مفقود.' });
        }

        const ENDPOINT = `https://api.alragheb-store.com/client/api/newOrder/${product_id}/params?qty=${qty}&playerId=${playerId}&order_uuid=${order_uuid}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 ثانية

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const rawData = await response.json();
        console.log('Alragheb API Raw Response:', JSON.stringify(rawData));

        // إذا كان السيرفر الخارجي أرجع خطأ صريحاً
        if (rawData.success === false || rawData.error) {
            return NextResponse.json({ 
                success: false, 
                message: rawData.message || rawData.error || 'رفض السيرفر تنفيذ الطلب' 
            });
        }

        const orderData = rawData.data;
        const orderStatus = orderData?.status || rawData["الحالة"] || "";
        const message = rawData.message || rawData["الرسالة"] || "";
        const orderId = orderData?.order_id || (rawData.data ? rawData.data['رقم_الطلب'] : "");

        const statusLower = String(orderStatus).toLowerCase().trim();

        if (statusLower === 'accept' || statusLower === 'موافق' || statusLower === 'مقبول' || statusLower === 'نجاح') {
            return NextResponse.json({ 
                success: true, 
                status_type: 'completed', 
                message: 'تم تنفيذ الطلب بنجاح', 
                order_id: orderId 
            });
        } else if (statusLower === 'wait' || statusLower === 'انتظار' || statusLower === '') {
            return NextResponse.json({ 
                success: true, 
                status_type: 'pending', 
                message: 'الطلب قيد الانتظار في السيرفر، تم حجز الرصيد', 
                order_id: orderId 
            });
        } else if (statusLower === 'reject' || statusLower === 'رفض') {
            return NextResponse.json({ 
                success: false, 
                message: message || 'تم رفض الطلب من المزود وعاد الرصيد' 
            });
        } else {
            return NextResponse.json({ 
                success: true, 
                status_type: 'pending', 
                message: message || ('جاري المعالجة (حالة: ' + orderStatus + ')'), 
                order_id: orderId 
            });
        }
    
    } catch (error: any) {
        console.error("Critical Order API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.name === 'AbortError' ? 'فشل الاتصال: السيرفر لم يستجب في الوقت المحدد.' : 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
