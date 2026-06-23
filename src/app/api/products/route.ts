
import { NextResponse } from 'next/server';

/**
 * FORCE DYNAMIC: تعطيل التخزين المؤقت لضمان جلب أحدث الأسعار والبيانات دائماً.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";
const FIXED_USER_ID = "2225";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    // بناء الرابط مع إضافة user_id الصارم لفك حظر المنتجات
    let endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products?user_id=${FIXED_USER_ID}`;
    
    if (categoryId) {
      endpoint += `&category_id=${categoryId}`;
    }

    console.log(`[AL-RAGHEB LIVE FETCH] ${new Date().toISOString()} - Endpoint: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'api-token': AL_RAGHEB_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // منع التخزين على مستوى الـ Fetch الخاص بـ Next.js
      cache: 'no-store'
    });

    const data = await response.json();
    
    // إرجاع البيانات مع هيدرز تمنع التخزين في المتصفح أو أي CDN
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error("[PROXY SYSTEM CRITICAL ERROR]:", error);
    return NextResponse.json(
      { error: "تعذر الاتصال بسيرفر الراغب حالياً.", details: error.message },
      { 
        status: 500,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }
}
