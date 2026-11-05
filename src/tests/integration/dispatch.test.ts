import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/client";
import { BatchService } from "@/lib/services/batch-service";
import { DispatchService } from "@/lib/services/dispatch-service";

describe("DispatchService - Despacho Asistido y Bloqueo FIFO (US2)", () => {
  beforeEach(() => {
    db.clearAll();
  });

  it("debe bloquear la salida de un lote Verde si se omite un lote Rojo Urgente sin justificación", () => {
    // 1. Ingresar lote Rojo (<48h)
    const batchRed = BatchService.registerQuickEntry({
      sku: "SKU-YOGURT",
      batch_number: "LOTE-ROJO-1",
      quantity: 10,
      expiration_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
      operator_name: "Operador A",
    });

    // 2. Ingresar lote Verde (>7d)
    const batchGreen = BatchService.registerQuickEntry({
      sku: "SKU-YOGURT",
      batch_number: "LOTE-VERDE-2",
      quantity: 20,
      expiration_date: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
      operator_name: "Operador B",
    });

    // 3. Intentar despachar desde el lote Verde sin override
    const result = DispatchService.executeDispatch({
      sku: "SKU-YOGURT",
      quantity: 5,
      operator_name: "Voluntario Intento",
      force_override: false,
      allocations: [{ batch_id: batchGreen.id, quantity: 5 }],
    });

    expect(result.success).toBe(false);
    expect(result.isViolation).toBe(true);
    expect(result.message).toContain("Violación FIFO detectada");
  });

  it("debe permitir la salida con override justificado cuando se solicita expresamente", () => {
    const batchRed = BatchService.registerQuickEntry({
      sku: "SKU-YOGURT",
      batch_number: "LOTE-ROJO-1",
      quantity: 10,
      expiration_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
      operator_name: "Operador A",
    });

    const batchGreen = BatchService.registerQuickEntry({
      sku: "SKU-YOGURT",
      batch_number: "LOTE-VERDE-2",
      quantity: 20,
      expiration_date: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
      operator_name: "Operador B",
    });

    const result = DispatchService.executeDispatch({
      sku: "SKU-YOGURT",
      quantity: 5,
      operator_name: "Voluntario Autorizado",
      force_override: true,
      override_reason: "Lote Rojo apartado para inspección de calidad sanitaria",
      allocations: [{ batch_id: batchGreen.id, quantity: 5 }],
    });

    expect(result.success).toBe(true);
    expect(result.isViolation).toBe(false);
    expect(result.product?.remaining_stock).toBe(25);
  });
});

