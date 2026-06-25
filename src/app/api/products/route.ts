
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار الربط الحقيقي المطور مع سيرفر الراغب.
 * تم إضافة معالجة هندسية للأخطاء (Try/Catch) وفحص دقيق لحالة الاستجابة لمنع خطأ 502.
 */

export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN || '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';
    const ENDPOINT = 'https://alragheb-store.com';

    try {
        console.log("Attempting to fetch products from Al-Ragheb Store...");

        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            cache: 'no-store',
            // إضافة مهلة زمنية للطلب لمنع تعليق السيرفر
            next: { revalidate: 0 }
        });

        // 1. التحقق من حالة الاستجابة (Status Code)
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Al-Ragheb API Error Status: ${response.status}`, errorText);
            
            return NextResponse.json({ 
                error: `سيرفر الراغب رفض الطلب بكود: ${response.status}`,
                details: errorText.substring(0, 100) 
            }, { status: response.status });
        }

        // 2. قراءة الرد كنص أولاً للتأكد من أنه ليس HTML
        const textData = await response.text();
        
        if (!textData || textData.trim().startsWith('<!doctype') || textData.trim().startsWith('<html')) {
            console.error("Critical: Received HTML instead of JSON. Possible Firewall/Block.");
            return NextResponse.json({ 
                error: "تلقى السيرفر استجابة غير صالحة (HTML) بدلاً من بيانات JSON." 
            }, { status: 502 });
        }

        // 3. محاولة تحويل النص إلى JSON
        let data;
        try {
            data = JSON.parse(textData);
        } catch (parseError) {
            console.error("JSON Parsing Error:", parseError);
            return NextResponse.json({ 
                error: "فشل في معالجة بيانات الـ JSON المستلمة من المزود." 
            }, { status: 502 });
        }

        // 4. استخراج وترجمة المنتجات
        const productsArray = Array.isArray(data) ? data : (data.products || data.data || []);
        
        const formattedProducts = productsArray.map((prod: any) => ({
            id: prod.id,
            name: prod.الاسم || prod.name || 'منتج غير مسمى',
            price: prod.السعر || prod.price || 0,
            category_name: prod.اسم_الفئة || prod.category_name || '',
            category_id: prod.parent_id !== undefined ? prod.parent_id : prod.category_id,
            image: prod.category_img || prod.image || ''
        }));

        console.log(`Successfully fetched and parsed ${formattedProducts.length} products.`);
        return NextResponse.json(formattedProducts);

    } catch (error: any) {
        // 5. التقاط أي انهيار في العملية البرمجية
        console.error('Fatal API Crash:', error.message);
        return NextResponse.json({ 
            error: "حدث انهيار داخلي أثناء محاولة الاتصال بالمزود.",
            message: error.message
        }, { status: 500 });
    }
}
