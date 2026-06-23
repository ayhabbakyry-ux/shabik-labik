import { NextResponse } from 'next/server';

/**
 * FORCE DYNAMIC: Disable caching to ensure live data and bypass cloud detection.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    // The strict target endpoint
    const targetEndpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;

    // Strict, clean payload body
    const bodyData = {
      email: "ayhmbakyr213@gmail.com",
      username: "ayhmbakyr213@gmail.com",
      name: "ايهم باكير",
      user_id: 2225,
      category_id: categoryId ? Number(categoryId) : undefined
    };

    console.log(`[PRODUCTION FETCH] Calling Al-Ragheb for Category: ${categoryId}`);

    // SANITIZED REQUEST: No extra headers, no traces.
    const response = await fetch(targetEndpoint, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bodyData),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return clean JSON with cache-busting headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error("[FETCH ERROR]:", error);
    return NextResponse.json(
      { error: "Fetch failed.", details: error.message },
      { 
        status: 500,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }
}
