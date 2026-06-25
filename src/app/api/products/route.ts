
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const API_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    const response = await fetch(`${AL_RAGHEB_BASE_URL}/client/api/products`, {
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
    console.error("[AL-RAGHEB API ERROR]:", error.message);
    
    // بيانات احتياطية في حال تعطل السيرفر المؤقت
    const MOCK_DATA: Record<string, any[]> = {
      "2": [
        { id: 101, name: "ببجي موبايل 60 UC", price: 15000 },
        { id: 102, name: "ببجي موبايل 325 UC", price: 65000 }
      ],
      "6": [
        { id: 201, name: "سيريتل 500 وحدة", price: 6500 },
        { id: 202, name: "سيريتل 1000 وحدة", price: 13000 }
      ]
    };

    return NextResponse.json(categoryId ? (MOCK_DATA[categoryId] || []) : []);
  }
}
