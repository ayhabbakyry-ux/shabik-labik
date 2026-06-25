import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALRAGHEB_API_URL = "https://alragheb-store.com/client/api/products";

export async function GET() {
  const API_TOKEN = process.env.ALRAGHEB_TOKEN || '64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0';

  try {
    const response = await fetch(ALRAGHEB_API_URL, {
      method: 'GET',
      headers: {
        'api-token': API_TOKEN.trim(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ALRAGHEB API ERROR]: Status ${response.status}`, errorText);
      return NextResponse.json({ error: "فشل الاتصال بمزود الخدمة" }, { status: response.status });
    }

    const data = await response.json();
    
    // استخراج مصفوفة المنتجات بناءً على هيكلية الراغب
    const products = data.data || data.products || (Array.isArray(data) ? data : []);

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("[API ROUTE ERROR]:", error.message);
    return NextResponse.json({ error: "حدث خطأ داخلي في السيرفر" }, { status: 500 });
  }
}
