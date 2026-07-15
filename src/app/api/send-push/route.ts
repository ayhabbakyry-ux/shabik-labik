
import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار إرسال إشعارات FCM - نسخة مستقرة للمحفزات الثلاثة.
 */

export async function POST(request: Request) {
    try {
        const { token, title, body, data } = await request.json();
        
        if (!token) return NextResponse.json({ success: false, error: 'No Token' });

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
                    click_action: "https://shabik-labik.vercel.app/history",
                    icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg"
                },
                data: data || {},
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
