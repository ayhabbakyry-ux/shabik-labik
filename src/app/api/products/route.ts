import { NextResponse } from 'next/server';

/**
 * SERVER-SIDE PROXY: Al-Ragheb API
 * Adheres strictly to parts 1-5 of the provided documentation.
 */
const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type'); // 'list', 'content', 'order', 'check'
    const productId = searchParams.get('productId');
    const qty = searchParams.get('qty') || '1';
    const playerId = searchParams.get('playerId');
    const orderUuid = searchParams.get('orderUuid');
    const orderId = searchParams.get('orderId');

    let endpoint = "";

    if (type === 'order' && productId && orderUuid) {
      // Create Order Endpoint: GET /client/api/newOrder/{product_id}/params
      // Documentation Part 3: Mandatory qty, playerId, order_uuid
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/newOrder/${productId}/params?qty=${qty}&order_uuid=${orderUuid}`;
      if (playerId) endpoint += `&playerId=${encodeURIComponent(playerId)}`;
    } else if (type === 'check' && (orderId || orderUuid)) {
      // Order Check Endpoint: Documentation Part 4
      if (orderUuid) {
        endpoint = `${AL_RAGHEB_BASE_URL}/client/api/check?orders=${orderUuid}&uuid=1`;
      } else {
        endpoint = `${AL_RAGHEB_BASE_URL}/client/api/check?orders=${orderId}`;
      }
    } else if (categoryId) {
      // Content/Discovery Endpoint: GET /client/api/content/[id]
      // Documentation Part 2: root is 0
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/content/${categoryId}`;
    } else {
      // Default to Product List: GET /client/api/products
      // Documentation Part 1 & 2
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;
    }

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

    // Documentation Part 5: Error handling integration
    // Many API responses might return 200 with an error status in the body
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Al-Ragheb Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Al-Ragheb server.", code: 500 },
      { status: 500 }
    );
  }
}
