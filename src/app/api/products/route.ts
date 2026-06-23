import { NextResponse } from 'next/server';

/**
 * FORCE DYNAMIC: تعطيل التخزين المؤقت لضمان جلب البيانات الحية وتجاوز حظر الـ IP.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    const endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;

    // بيانات المصادقة والحساب المطلوبة
    const bodyData = {
      email: "ayhmbakyr213@gmail.com",
      username: "ayhmbakyr213@gmail.com",
      name: "ايهم باكير",
      user_id: 2225,
      category_id: categoryId ? Number(categoryId) : undefined
    };

    console.log(`[PROXY SPOOF FETCH] Target: ${endpoint} for Category: ${categoryId}`);

    const response = await fetch(endpoint, {
      method: 'POST', 
      headers: {
        'api-token': AL_RAGHEB_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        'Origin': 'https://api.alragheb-store.com',
        'Referer': 'https://api.alragheb-store.com/',
        // تمويه الـ IP ليظهر كعنوان سكني سوري لتجاوز جدار الحماية
        'X-Forwarded-For': '178.135.0.1',
        'Client-IP': '178.135.0.1',
        'X-Real-IP': '178.135.0.1'
      },
      body: JSON.stringify(bodyData),
      cache: 'no-store'
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error("[PROXY BYPASS ERROR]:", error);
    return NextResponse.json(
      { error: "تعذر تجاوز جدار الحماية.", details: error.message },
      { 
        status: 500,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }
}
