import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 }
      );
    }

    // Build query string from search params
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/events/all${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to get all events" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting all events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
