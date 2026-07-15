
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار إرسال إشعارات FCM المطور - يستخدم متغيرات البيئة للأمان المطلق.
 */

export async function POST(request: Request) {
    try {
        const { token, title, body, data } = await request.json();
        
        if (!token) {
            return NextResponse.json({ success: false, error: 'Recipient Token is missing' });
        }

        // جلب مفتاح السيرفر من متغيرات البيئة (Vercel Environment Variables)
        const SERVER_KEY = process.env.FCM_SERVER_KEY; 

        if (!SERVER_KEY || SERVER_KEY === "YOUR_SERVER_KEY") {
            console.error("FCM API: Missing FCM_SERVER_KEY in environment.");
            return NextResponse.json({ success: false, error: 'Server configuration missing' });
        }

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
        return NextResponse.json({ success: true, info: resData });
    } catch (error: any) {
        console.error("Push API Critical Error:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) });
    }
}
