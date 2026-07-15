import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار إرسال إشعارات FCM - نسخة مستقرة للمحفزات الثلاثة مع أولوية قصوى.
 */

export async function POST(request: Request) {
    try {
        const { token, title, body, data } = await request.json();
        
        if (!token) return NextResponse.json({ success: false, error: 'No Token' });

        // ملاحظة: هذا المفتاح يجب أن يكون مفتاح سيرفر FCM الفعلي من لوحة تحكم فايربيز
        const SERVER_KEY = process.env.FCM_SERVER_KEY || "AAAA...REPLACE_WITH_ACTUAL_KEY"; 

        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${SERVER_KEY}`
            },
            body: JSON.stringify({
                to: token,
                notification: {
                    title: title,
                    body: body,
                    sound: "default",
                    badge: "1",
                    click_action: "https://shabik-labik.vercel.app/history",
                    icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg"
                },
                data: {
                    ...data,
                    url: "https://shabik-labik.vercel.app/history"
                },
                priority: "high"
            })
        });

        const resData = await response.json();
        return NextResponse.json({ success: true, resData });
    } catch (error: any) {
        console.error("Push API Critical Error:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}
