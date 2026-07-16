
import { NextResponse } from 'next/server';

/**
 * @fileOverview محرك إرسال إشعارات FCM - النسخة النهائية المستقرة.
 * تم ضبطه ليتوافق مع ستارة الموبايل (System Tray) عبر الأولوية القصوى.
 */

export async function POST(request: Request) {
    try {
        const { token, title, body, url } = await request.json();
        
        if (!token) {
            return NextResponse.json({ success: false, error: 'Recipient Token is missing' });
        }

        const SERVER_KEY = process.env.FCM_SERVER_KEY; 

        if (!SERVER_KEY) {
            console.error("FCM API: Missing FCM_SERVER_KEY in environment.");
            return NextResponse.json({ success: false, error: 'Server key not configured' });
        }

        // بناء الحمولة (Payload) التي تجبر النظام على عرض الإشعار
        const payload = {
            to: token,
            notification: {
                title: title,
                body: body,
                sound: "default",
                icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
                click_action: url || "https://shabik-labik.vercel.app/history",
                android_channel_id: "shabik_notifs"
            },
            data: {
                url: url || "https://shabik-labik.vercel.app/history",
                title: title,
                body: body
            },
            priority: "high",
            content_available: true
        };

        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${SERVER_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();
        console.log("FCM Delivery Result:", JSON.stringify(resData));

        return NextResponse.json({ success: true, info: resData });
    } catch (error: any) {
        console.error("FCM API Critical Catch:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}
