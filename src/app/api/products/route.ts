import { NextResponse } from 'next/server';

/**
 * SERVER-SIDE PROXY: Al-Ragheb API
 * Updated to use the correct /client/api/products endpoint and api-token header.
 */
const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET() {
  try {
    // Official endpoint from documentation: /client/api/products
    const endpoint = `${AL_RAGHEB_BASE_URL}/client/api/products`;
    
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
