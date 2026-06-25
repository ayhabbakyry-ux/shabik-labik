
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * @fileOverview مسار الربط الحقيقي مع سيرفر الراغب لخدمات الشحن التلقائي.
 */

export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN || '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

    try {
        console.log("Initiating fetch to Al-Ragheb Store API...");
        const response = await fetch('https://alragheb-store.com', {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            cache: 'no-store'
        });

        const textData = await response.text();
        
        // فحص الرد للتأكد من أنه JSON وليس صفحة HTML
        if (!textData || textData.trim().startsWith('<!doctype') || textData.trim().startsWith('<html')) {
            console.error("Critical: Received HTML instead of JSON. Check Token or Firewall.");
            return NextResponse.json({ error: "تعذر الحصول على البيانات البرمجية من المزود (HTML Response)" }, { status: 502 });
        }

        const data = JSON.parse(textData);
        // استخراج مصفوفة المنتجات بناءً على هيكلية الراغب المتغيرة
        const productsArray = Array.isArray(data) ? data : (data.products || data.data || []);
        
        if (productsArray.length === 0) {
            console.warn("API connected but returned empty products array.");
            return NextResponse.json([]);
        }

        // ترجمة الحقول العربية من السيرفر لضمان عمل الواجهة
        const formattedProducts = productsArray.map((prod: any) => ({
            id: prod.id,
            name: prod.الاسم || prod.name || 'منتج غير مسمى',
            price: prod.السعر || prod.price || 0,
            category_name: prod.اسم_الفئة || prod.category_name || '',
            category_id: prod.parent_id !== undefined ? prod.parent_id : prod.category_id,
            image: prod.category_img || prod.image || ''
        }));

        console.log(`Successfully parsed ${formattedProducts.length} products.`);
        return NextResponse.json(formattedProducts);

    } catch (error: any) {
        console.error('API Connection failure:', error.message);
        return NextResponse.json({ error: "فشل الاتصال بسيرفر المنتجات، يرجى التحقق من التوكن." }, { status: 500 });
    }
}
