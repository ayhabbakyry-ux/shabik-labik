
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";

// بيانات وهمية (Mock Data) مطابقة تماماً لهيكلية الراغب لاستخدامها في حال فشل الـ API
const MOCK_PRODUCTS = {
  // فئة الألعاب (CategoryId 2)
  "2": [
    { id: 101, name: "PUBG Mobile 60 UC", price: 15000, options: [] },
    { id: 102, name: "PUBG Mobile 325 UC", price: 65000, options: [] },
    { id: 103, name: "Free Fire 100 Diamonds", price: 12000, options: [] },
    { id: 104, name: "Free Fire 210 Diamonds", price: 24000, options: [] }
  ],
  // فئة الاتصالات (CategoryId 6)
  "6": [
    { id: 201, name: "سيريتل 500 وحدة", price: 6500, options: [] },
    { id: 202, name: "سيريتل 1000 وحدة", price: 13000, options: [] },
    { id: 203, name: "إم تي إن 500 وحدة", price: 6500, options: [] },
    { id: 204, name: "إم تي إن 1000 وحدة", price: 13000, options: [] },
    { id: 205, name: "فاتورة سيريتل", price: 0, options: [{id: 2051, name: "تسديد فاتورة", price: 5000}] }
  ],
  // فئة التطبيقات (CategoryId 1)
  "1": [
    { id: 301, name: "TikTok 100 Coins", price: 18000, options: [] },
    { id: 302, name: "Likee 50 Diamonds", price: 10000, options: [] }
  ],
  // فئة البطاقات (CategoryId 5)
  "5": [
    { id: 401, name: "Google Play $5", price: 75000, options: [] },
    { id: 402, name: "Netflix Premium 1 Month", price: 45000, options: [] }
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    const targetEndpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;
    const bodyData = {
      email: "ayhmbakyr213@gmail.com",
      username: "ayhmbakyr213@gmail.com",
      name: "ايهم باكير",
      user_id: 2225,
      category_id: categoryId ? Number(categoryId) : undefined
    };

    const response = await fetch(targetEndpoint, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bodyData),
      cache: 'no-store',
      // إضافة مهلة زمنية للطلب
      signal: AbortSignal.timeout(5000) 
    });

    if (!response.ok) {
      throw new Error(`Server Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[API FETCH SUCCESS]:", data);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("[PRODUCTION API ERROR - SWITCHING TO MOCK DATA]:", error.message);
    
    // إرجاع البيانات الوهمية بناءً على الـ CategoryId المطلوب لضمان عمل الواجهة
    const fallbackData = categoryId && MOCK_PRODUCTS[categoryId as keyof typeof MOCK_PRODUCTS] 
      ? MOCK_PRODUCTS[categoryId as keyof typeof MOCK_PRODUCTS] 
      : Object.values(MOCK_PRODUCTS).flat();

    return NextResponse.json(fallbackData, {
      headers: {
        'X-Mock-Data': 'true',
        'Cache-Control': 'no-store'
      }
    });
  }
}
