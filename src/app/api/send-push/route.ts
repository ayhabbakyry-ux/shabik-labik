
import { NextResponse } from 'next/server';

/**
 * @fileOverview محرك إرسال إشعارات FCM - النسخة الاحترافية لضمان الظهور في ستارة الموبايل.
 */

export async function POST(request: Request) {
    try {
        const { token, title, body, url } = await request.json();
        
        if (!token) {
            return NextResponse.json({ success: false, error: 'Token missing' });
        }

        // مفتاح السيرفر الخاص بفايربيز - يجب التأكد منه في الكونسول
        const SERVER_KEY = process.env.FCM_SERVER_KEY || "AAAA4R9-R0E:APA91bGk_X8G_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X"; 

        const payload = {
            to: token,
            notification: {
                title: title,
                body: body,
                sound: "default",
                priority: "high",
                icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
                click_action: url || "https://shabik-labik.vercel.app/history"
            },
            data: {
                title: title,
                body: body,
                url: url || "/history",
                click_action: url || "/history"
            },
            priority: "high",
            content_available: true,
            android: {
                priority: "high",
                notification: {
                    channel_id: "shabik_labik_high_priority",
                    sound: "default"
                }
            }
        };

        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${SERVER_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const info = await response.json();
        console.log("FCM Direct Response:", info);

        return NextResponse.json({ success: true, info });
    } catch (error: any) {
        console.error("FCM API Critical Error:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}
