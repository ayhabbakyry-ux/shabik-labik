
import { NextResponse } from 'next/server';

/**
 * SERVER-SIDE PROXY: Al-Ragheb API
 * مرسل الطلبات لضمان عدم حدوث مشاكل CORS وتمرير البيانات الخام.
 */
const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    // بناء الرابط الصحيح لجلب المنتجات بناءً على الفئة
    const endpoint = categoryId 
      ? `${AL_RAGHEB_BASE_URL}/client/api/products?category_id=${categoryId}`
      : `${AL_RAGHEB_BASE_URL}/client/api/products`;

    console.log(`[AL-RAGHEB PROXY] Fetching from: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'api-token': AL_RAGHEB_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    // التحقق من حالة الاستجابة من السيرفر
    if (response.status !== 200) {
      console.error("[AL-RAGHEB ERROR]", data);
      return NextResponse.json({ error: data.message || "API Error" }, { status: response.status });
    }

    // إرجاع البيانات الخام كما هي تماماً
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[PROXY SYSTEM ERROR]:", error);
    return NextResponse.json(
      { error: "تعذر الاتصال بسيرفر الراغب حالياً.", details: error.message },
      { status: 500 }
    );
  }
}
