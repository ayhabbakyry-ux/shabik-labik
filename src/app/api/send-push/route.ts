import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار إرسال إشعارات FCM - يستخدم بروتوكول Legacy لضمان التوافق الفوري.
 * يرجى إضافة FCM_SERVER_KEY في إعدادات البيئة (Vercel Env).
 */

export async function POST(request: Request) {
    try {
        const { token, title, body } = await request.json();
        
        // مفتاح السيرفر (يمكنك الحصول عليه من Firebase Console -> Project Settings -> Cloud Messaging)
        const SERVER_KEY = process.env.ALRAGHEB_TOKEN || "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0"; 

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
                    icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg"
                },
                priority: "high"
            })
        });

        const data = await response.json();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Push Send API Error:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}