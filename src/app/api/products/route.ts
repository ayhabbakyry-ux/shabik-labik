
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const API_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    // الاتصال بسيرفر الراغب باستخدام الـ Token الحقيقي
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
      console.error(`[ALRAGHEB API ERROR]: Status ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    
    // استخراج المنتجات حسب هيكلية الراغب الفعلية
    // غالباً ما تكون في data.data أو مباشرة في المصفوفة
    const products = data.data || data.products || (Array.isArray(data) ? data : []);

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("[API ERROR]:", error.message);
    return NextResponse.json([]);
  }
}
