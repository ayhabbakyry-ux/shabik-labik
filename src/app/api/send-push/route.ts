import { NextResponse } from 'next/server';

/**
 * @fileOverview محرك إرسال إشعارات FCM المطور - نسخة التوافق العالي للستارة.
 */

export async function POST(request: Request) {
    try {
        const { token, title, body, url } = await request.json();
        
        if (!token) {
            return NextResponse.json({ success: false, error: 'Token missing' });
        }

        // المفتاح الرسمي لضمان الوصول (Legacy HTTP Protocol)
        const SERVER_KEY = "AAAA4R9-R0E:APA91bGk_WvI6A_O79Y5Wp-3P37L5X9pI9S9G8h7K6J5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0A9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9V8W7X6Y5Z4A3B2C1D0"; 

        const payload = {
            to: token,
            notification: {
                title: title,
                body: body,
                sound: "default",
                icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
                click_action: url || "/history",
                android_channel_id: "shabik_labik_high_priority"
            },
            data: {
                title: title,
                body: body,
                url: url || "/history"
            },
            priority: "high"
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
        return NextResponse.json({ success: true, info });
    } catch (error: any) {
        console.error("FCM API Error:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}
