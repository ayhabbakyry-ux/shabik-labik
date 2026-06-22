import { NextResponse } from 'next/server';

/**
 * SERVER-SIDE PROXY: Al-Ragheb API
 * Handles products, categories, and order creation.
 */
const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type'); // 'list', 'content', 'order'
    const productId = searchParams.get('productId');
    const qty = searchParams.get('qty') || '1';
    const playerId = searchParams.get('playerId');
    const orderUuid = searchParams.get('orderUuid');

    let endpoint = "";

    if (type === 'order' && productId && orderUuid) {
      // Create Order Endpoint: GET /client/api/newOrder/{product_id}/params
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/newOrder/${productId}/params?qty=${qty}&order_uuid=${orderUuid}`;
      if (playerId) endpoint += `&playerId=${encodeURIComponent(playerId)}`;
    } else if (categoryId) {
      // Content Endpoint: GET /client/api/content/[id]
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/content/${categoryId}`;
    } else {
      // Default to Product List
      endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'api-token': AL_RAGHEB_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 } // No cache for order status/live data
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Provider error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Al-Ragheb Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Al-Ragheb server via proxy." },
      { status: 500 }
    );
  }
}
