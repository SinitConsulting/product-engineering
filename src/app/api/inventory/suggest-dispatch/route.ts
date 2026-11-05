import { NextRequest, NextResponse } from "next/server";
import { SuggestDispatchSchema } from "@/lib/validators/inventory-schemas";
import { DispatchService } from "@/lib/services/dispatch-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sku = searchParams.get("sku") || "";
    const quantityStr = searchParams.get("quantity") || "1";

    const parsed = SuggestDispatchSchema.safeParse({
      sku,
      quantity: parseInt(quantityStr, 10),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error_code: "VALIDATION_ERROR",
          message: "Parámetros de consulta inválidos",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const plan = DispatchService.getSuggestedPlan(parsed.data.sku, parsed.data.quantity);

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error_code: "DISPATCH_PLAN_ERROR",
        message: error.message || "Error al calcular el plan de despacho",
      },
      { status: 404 }
    );
  }
}

