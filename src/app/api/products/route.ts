import { NextResponse } from 'next/server';

/**
 * SERVER-SIDE PROXY: Al-Ragheb API
 * This route bypasses CORS restrictions and keeps the API token secure.
 * Updated to use the correct /api/v1/services endpoint as per Al-Ragheb documentation.
 */
const AL_RAGHEB_BASE_URL = "https://api.alragheb-store.com";
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

export async function GET() {
  try {
    // Correct endpoint for Al-Ragheb digital services listing
    const endpoint = `${AL_RAGHEB_BASE_URL}/api/v1/services`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AL_RAGHEB_AUTH_TOKEN}`,
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
