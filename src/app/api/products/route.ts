
import { NextResponse } from 'next/server';

/**
 * SERVER-SIDE PROXY: Al-Ragheb API
 * Adheres strictly to the 5-part documentation.
 */
const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const productId = searchParams.get('productId');
    const qty = searchParams.get('qty') || '1';
    const playerId = searchParams.get('playerId');
    const orderUuid = searchParams.get('orderUuid');
    const orderId = searchParams.get('orderId');

    let endpoint = "";

    if (type === 'order' && productId && orderUuid) {
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/newOrder/${productId}/params?qty=${qty}&order_uuid=${orderUuid}`;
      if (playerId) endpoint += `&playerId=${encodeURIComponent(playerId)}`;
    } else if (type === 'check' && (orderId || orderUuid)) {
      if (orderUuid) {
        endpoint = `${AL_RAGHEB_BASE_URL}/client/api/check?orders=${orderUuid}&uuid=1`;
      } else {
        endpoint = `${AL_RAGHEB_BASE_URL}/client/api/check?orders=${orderId}`;
      }
    } else if (categoryId !== null) {
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products?category_id=${categoryId}`;
    } else {
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;
    }

    console.log(`[PROXY REQUEST] Target: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'api-token': AL_RAGHEB_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 }
    });

    const data = await response.json();
    console.log(`[PROXY RESPONSE] Status: ${response.status}, Endpoint: ${endpoint}, Data Items Found: ${Array.isArray(data) ? data.length : (data.data ? data.data.length : 'N/A')}`);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[PROXY ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to connect to Al-Ragheb server.", code: 500 },
      { status: 500 }
    );
  }
}
