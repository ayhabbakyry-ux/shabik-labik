
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
    
    // بناء الرابط الأساسي
    const endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;

    // تجهيز البيانات المطلوبة في الـ Body كما يتوقعها السيرفر
    const bodyData = {
      user_id: FIXED_USER_ID,
      category_id: categoryId || undefined
    };

    console.log(`[AL-RAGHEB LIVE POST FETCH] ${new Date().toISOString()} - Payload:`, bodyData);

    const response = await fetch(endpoint, {
      method: 'POST', // تحويل الطلب لـ POST لفك حظر المنتجات
      headers: {
        'api-token': AL_RAGHEB_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
