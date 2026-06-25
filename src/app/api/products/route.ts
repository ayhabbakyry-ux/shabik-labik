
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    const targetEndpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;
    
    // Al-Ragheb API parameters
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
    });

    if (!response.ok) {
      throw new Error(`API Connection Failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Al-Ragheb returns data in different shapes sometimes
    let products = [];
    if (Array.isArray(data)) {
      products = data;
    } else if (data.data && Array.isArray(data.data)) {
      products = data.data;
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products;
    }

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("[AL-RAGHEB API PROXY ERROR]:", error.message);
    
    // Robust Mock Data in case of failure
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
      ],
      "1": [
        { id: 301, name: "لايكي 100 ماسة", price: 20000 },
        { id: 302, name: "تيك توك 70 عملة", price: 18000 }
      ],
      "5": [
        { id: 401, name: "جوجل بلاي 5$", price: 45000 },
        { id: 402, name: "نتفليكس شهر", price: 35000 }
      ]
    };

    const fallback = categoryId ? (MOCK_DATA[categoryId] || []) : [];
    return NextResponse.json(fallback);
  }
}
