import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const API_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    // محاولة جلب المنتجات باستخدام طلب POST (وهو الشائع في أنظمة الراغب)
    const response = await fetch(`${AL_RAGHEB_BASE_URL}/api/products`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        category_id: categoryId ? Number(categoryId) : undefined
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // استخراج المنتجات حسب هيكلية الراغب (غالباً تكون في data.data أو data)
    const products = data.data || data.products || (Array.isArray(data) ? data : []);

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("[API ERROR]:", error.message);
    
    // بيانات احتياطية لضمان عمل الواجهة في حال وجود مشكلة تقنية مؤقتة
    const fallbackData = [
      { id: 1, name: "منتج تجريبي 1", price: 1000 },
      { id: 2, name: "منتج تجريبي 2", price: 2000 }
    ];
    
    return NextResponse.json([]);
  }
}
