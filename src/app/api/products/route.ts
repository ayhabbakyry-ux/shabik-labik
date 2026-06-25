
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    // هذه البيانات يجب تحديثها بالمفاتيح التي ستزودني بها
    const bodyData = {
      email: "ayhmbakyr213@gmail.com",
      username: "ayhmbakyr213@gmail.com",
      name: "ايهم باكير",
      user_id: 2225,
      // أضف الـ Token هنا بمجرد إرساله
      category_id: categoryId ? Number(categoryId) : undefined
    };

    const response = await fetch(`${AL_RAGHEB_BASE_URL}/client/api/products`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bodyData),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API Connection Failed: ${response.status}`);
    }

    const data = await response.json();
    
    // معالجة استجابة الراغب القياسية
    let products = [];
    if (data.status === "success" || data.data) {
      products = data.data || data.products || data;
    } else {
      products = Array.isArray(data) ? data : (data.products || []);
    }

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("[AL-RAGHEB PROXY ERROR]:", error.message);
    
    // بيانات وهمية متطورة في حال فشل الـ API (لحين وضع المفاتيح)
    const MOCK_DATA: Record<string, any[]> = {
      "2": [
        { id: 101, name: "ببجي موبايل 60 UC", price: 15000 },
        { id: 102, name: "ببجي موبايل 325 UC", price: 65000 },
        { id: 103, name: "ببجي موبايل 660 UC", price: 125000 }
      ],
      "6": [
        { id: 201, name: "سيريتل 500 وحدة", price: 6500 },
        { id: 202, name: "سيريتل 1000 وحدة", price: 13000 },
        { id: 203, name: "MTN 500 وحدة", price: 6500 }
      ]
    };

    return NextResponse.json(categoryId ? (MOCK_DATA[categoryId] || []) : []);
  }
}
