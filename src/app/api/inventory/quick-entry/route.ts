import { NextRequest, NextResponse } from "next/server";
import { QuickEntrySchema } from "@/lib/validators/inventory-schemas";
import { BatchService } from "@/lib/services/batch-service";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = QuickEntrySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error_code: "VALIDATION_ERROR",
          message: "Datos de entrada inválidos",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = BatchService.registerQuickEntry(parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: {
          batch_id: result.id,
          product: {
            sku: result.product.sku,
            name: result.product.name,
            total_stock: result.product.currentTotalStock,
          },
          batch: {
            batch_number: result.batchNumber,
            available_quantity: result.availableQuantity,
            expiration_date: result.expirationDate,
            color_code: result.evaluation.code,
            color_hex: result.evaluation.hex,
            hours_remaining: result.evaluation.hoursRemaining,
            urgency_label: result.evaluation.label,
          },
          message: "Lote registrado y asignado a cola FIFO exitosamente.",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error_code: "INTERNAL_ERROR",
        message: error.message || "Error procesando el registro rápido de lote",
      },
      { status: 500 }
    );
  }
}

