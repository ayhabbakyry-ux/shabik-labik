
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    const targetEndpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;
    
    // إعداد البيانات المطلوبة من قبل API الراغب
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify(bodyData),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000) 
    });

    if (!response.ok) {
      throw new Error(`API Connection Failed: ${response.status}`);
    }

    const data = await response.json();
    
    // تنظيف البيانات لضمان توافقها مع واجهة المستخدم
    const products = Array.isArray(data) ? data : (data.data || data.products || []);
    
    return NextResponse.json(products);

  } catch (error: any) {
    console.error("[API ERROR]:", error.message);
    
    // بيانات وهمية احتياطية في حال فشل الاتصال الحقيقي
    const MOCK_DATA: any = {
      "2": [
        { id: 101, name: "PUBG Mobile 60 UC", price: 15000 },
        { id: 102, name: "PUBG Mobile 325 UC", price: 65000 }
      ],
      "6": [
        { id: 201, name: "سيريتل 500 وحدة", price: 6500 },
        { id: 202, name: "سيريتل 1000 وحدة", price: 13000 }
      ]
    };

    const fallback = categoryId ? (MOCK_DATA[categoryId] || []) : [];
    return NextResponse.json(fallback, { status: 200 });
  }
}
