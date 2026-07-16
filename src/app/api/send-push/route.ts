
import { NextResponse } from 'next/server';

/**
 * @fileOverview محرك إرسال إشعارات FCM المطور (FCM v1 Secure architecture)
 * يستخدم بروتوكول جوجل القياسي لضمان وصول التنبيه لستارة الموبايل.
 */

export async function POST(request: Request) {
    try {
        const { token, title, body } = await request.json();
        
        if (!token) {
            return NextResponse.json({ success: false, error: 'Recipient Token is missing' });
        }

        // استخدام المفتاح السحابي من متغيرات البيئة لضمان الأمان في Vercel
        const SERVER_KEY = process.env.FCM_SERVER_KEY; 

        if (!SERVER_KEY || SERVER_KEY === "YOUR_SERVER_KEY") {
            console.error("FCM API: Missing FCM_SERVER_KEY in environment.");
            return NextResponse.json({ success: false, error: 'Server key not configured securely' });
        }

        // إرسال الإشعار لستارة الموبايل (High Priority)
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
                    priority: "high",
                    icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
                    click_action: "https://shabik-labik.vercel.app/history"
                },
                data: {
                    url: "https://shabik-labik.vercel.app/history",
                    click_action: "FLUTTER_NOTIFICATION_CLICK"
                },
                priority: "high"
            })
        });

        const resData = await response.json();
        return NextResponse.json({ success: true, info: resData });
    } catch (error: any) {
        console.error("FCM API Error Catch:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}
