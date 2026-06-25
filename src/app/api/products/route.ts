
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALRAGHEB_API_URL = "https://alragheb-store.com/client/api/products";
// ضع التوكن الخاص بك هنا أو في ملف .env باسم ALRAGHEB_TOKEN
const API_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET() {
  try {
    const response = await fetch(ALRAGHEB_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-token': API_TOKEN
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[ALRAGHEB API ERROR]: Status ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    
    // التوثيق يشير إلى أن المنتجات تكون عادة في حقل data أو كصفوف مباشرة
    const products = data.data || data.products || (Array.isArray(data) ? data : []);

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("[API ROUTE ERROR]:", error.message);
    return NextResponse.json([]);
  }
}
