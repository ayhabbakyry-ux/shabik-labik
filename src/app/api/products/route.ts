import { NextResponse } from 'next/server';

/**
 * SERVER-SIDE PROXY: Al-Ragheb API
 * Handles both general product listings and specific category content.
 */
const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    // Determine endpoint based on whether a specific Category ID was requested
    const endpoint = categoryId 
      ? `${AL_RAGHEB_BASE_URL}/client/api/content/${categoryId}`
      : `${AL_RAGHEB_BASE_URL}/client/api/products`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'api-token': AL_RAGHEB_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Provider returned ${response.status}: ${errorText}` },
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
