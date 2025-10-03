import { NextResponse } from "next/server";
import { getStats } from "@/lib/db/queries";

export async function GET() {
  try {
    const { data, error } = await getStats();

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
