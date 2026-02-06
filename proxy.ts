import { NextRequest, NextResponse } from "next/server";

export function proxy(_request: NextRequest) {
  // Add your proxy logic here
  // This function runs for every request

  // Example: Allow all requests to pass through
  return NextResponse.next();
}
