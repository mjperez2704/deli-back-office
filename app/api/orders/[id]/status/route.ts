import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/db/queries";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
        return NextResponse.json(
            { success: false, error: "Status is required" },
            { status: 400 }
          );
    }

    const { data, error } = await updateOrderStatus(id, status, notes);

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
