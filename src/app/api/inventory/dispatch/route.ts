import { NextRequest, NextResponse } from "next/server";
import { DispatchSchema } from "@/lib/validators/inventory-schemas";
import { DispatchService } from "@/lib/services/dispatch-service";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = DispatchSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error_code: "VALIDATION_ERROR",
          message: "Datos de despacho inválidos",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = DispatchService.executeDispatch(parsed.data);

    if (!result.success && result.isViolation) {
      return NextResponse.json(
        {
          success: false,
          error_code: "FIFO_VIOLATION_DETECTED",
          message: result.message,
          suggested_batch: result.suggestedBatch,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error_code: "EXECUTION_ERROR",
        message: error.message || "Error al procesar el despacho",
      },
      { status: 500 }
    );
  }
}

