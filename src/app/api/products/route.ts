import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    // التوكن الصريح لضمان العمل الفوري وتجاوز مشاكل ملفات البيئة
    const HARDCODED_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";
    const ALRAGHEB_API_URL = "https://alragheb-store.com/client/api/products";

    try {
        console.log("[ALRAGHEB API]: Initiating request to " + ALRAGHEB_API_URL);

        const response = await fetch(ALRAGHEB_API_URL, {
            method: 'GET',
            headers: {
                'api-token': HARDCODED_TOKEN.trim(),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ALRAGHEB API ERROR]: Status ${response.status}`, errorText);
            return NextResponse.json(
                { error: `سيرفر الراغب أرجع خطأ: ${response.status}`, details: errorText }, 
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("[ALRAGHEB API SUCCESS]: Data received successfully");
        
        // استخراج مصفوفة المنتجات بناءً على هيكلية الراغب القياسية
        const productsArray = data.data || data.products || (Array.isArray(data) ? data : []);

        return NextResponse.json(productsArray);

    } catch (error: any) {
        console.error("[INTERNAL SERVER ERROR]:", error.message);
        return NextResponse.json(
            { error: 'حدث خطأ داخلي في السيرفر أثناء الاتصال', message: error.message }, 
            { status: 500 }
        );
    }
}
