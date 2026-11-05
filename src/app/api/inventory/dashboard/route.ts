import { NextRequest, NextResponse } from "next/server";
import { DashboardService } from "@/lib/services/dashboard-service";
import { ColorCode } from "@/lib/fifo/color-rules";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const colorFilter = searchParams.get("color_filter") as ColorCode | "ALL" | null;
    const search = searchParams.get("search") || undefined;

    const data = DashboardService.getDashboardData(colorFilter || "ALL", search);

    return NextResponse.json({
      success: true,
      summary: data.summary,
      batches: data.batches.map((b) => ({
        id: b.id,
        sku: b.product.sku,
        product_name: b.product.name,
        batch_number: b.batchNumber,
        available_quantity: b.availableQuantity,
        unit: b.product.unit,
        expiration_date: b.expirationDate,
        color_code: b.evaluation.code,
        color_hex: b.evaluation.hex,
        urgency_label: b.evaluation.label,
        icon: b.evaluation.iconName,
        entry_date: b.entryDate,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error_code: "DASHBOARD_ERROR",
        message: error.message || "Error al cargar datos del tablero",
      },
      { status: 500 }
    );
  }
}

