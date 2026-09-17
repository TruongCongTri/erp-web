import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { secret, tag } = await request.json();

    // Security: Ensure only YOUR backend can trigger this
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!tag) {
      return NextResponse.json(
        { message: "Missing tag param" },
        { status: 400 },
      );
    }

    // Flushes the cache for the specific tag (e.g., "departments-master")
    revalidateTag(tag, "max");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 },
    );
  }
}
