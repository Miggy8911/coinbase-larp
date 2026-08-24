import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids") ?? "";
  if (!ids) return NextResponse.json({});

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      ids
    )}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) {
      return NextResponse.json({}, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({});
  }
}
