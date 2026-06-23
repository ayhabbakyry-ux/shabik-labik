
import { NextResponse } from 'next/server';

/**
 * SERVER-SIDE PROXY: Al-Ragheb API
 * Robust debugging for Part 4/5 implementation.
 */
const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const productId = searchParams.get('productId');
    const orderUuid = searchParams.get('orderUuid');

    let endpoint = "";

    // Determine the correct endpoint based on params
    if (type === 'order' && productId && orderUuid) {
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/newOrder/${productId}/params?order_uuid=${orderUuid}`;
    } else if (categoryId) {
      // Primary: Category-specific
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products?category_id=${categoryId}`;
    } else {
      // Secondary: Global list
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;
    }

    console.log(`[PROXY REQUEST] Target: ${endpoint}`);
    console.log(`[PROXY HEADERS] Sending api-token: ${AL_RAGHEB_AUTH_TOKEN.substring(0, 5)}...`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'api-token': AL_RAGHEB_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 }
    });

    const status = response.status;
    const data = await response.json();

    console.log(`[PROXY RESPONSE] Status: ${status}, Endpoint: ${endpoint}`);
    
    // Check for Al-Ragheb specific error codes (Part 4 Error Dictionary)
    if (data.status === "error" || data.code) {
      console.warn(`[AL-RAGHEB ERROR] Code: ${data.code}, Message: ${data.message || 'Unknown'}`);
    }

    return NextResponse.json(data, { status });
  } catch (error: any) {
    console.error("[PROXY SYSTEM ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to connect to Al-Ragheb server.", details: error.message },
      { status: 500 }
    );
  }
}
