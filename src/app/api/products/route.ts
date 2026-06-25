import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALRAGHEB_API_URL = "https://alragheb-store.com/client/api/products";

export async function GET() {
  const API_TOKEN = process.env.ALRAGHEB_TOKEN;

  if (!API_TOKEN) {
    console.error("[ALRAGHEB API ERROR]: Token not found in .env");
    return NextResponse.json({ error: "API Token configuration missing" }, { status: 500 });
  }

  try {
    const response = await fetch(ALRAGHEB_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-token': API_TOKEN
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ALRAGHEB API ERROR]: Status ${response.status}`, errorText);
      return NextResponse.json({ error: "فشل الاتصال بمزود الخدمة" }, { status: response.status });
    }

    const data = await response.json();
    
    // استخراج مصفوفة المنتجات بناءً على هيكلية الراغب (data أو products أو مصفوفة مباشرة)
    const products = data.data || data.products || (Array.isArray(data) ? data : []);

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("[API ROUTE ERROR]:", error.message);
    return NextResponse.json({ error: "حدث خطأ داخلي في السيرفر" }, { status: 500 });
  }
}
