import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/client";
import { BatchService } from "@/lib/services/batch-service";

describe("BatchService - Registro Rápido Híbrido (US1)", () => {
  beforeEach(() => {
    db.clearAll();
  });

  it("debe registrar un lote nuevo y asociarlo a un producto creado automáticamente", () => {
    const input = {
      sku: "7751234567890",
      batch_number: "LOTE-2026-01",
      quantity: 50,
      expiration_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0], // Mañana (<48h)
      operator_name: "Voluntario Carlos",
    };

    const enriched = BatchService.registerQuickEntry(input);

    expect(enriched.id).toBeDefined();
    expect(enriched.batchNumber).toBe("LOTE-2026-01");
    expect(enriched.availableQuantity).toBe(50);
    expect(enriched.product.sku).toBe("7751234567890");
    expect(enriched.product.currentTotalStock).toBe(50);
    expect(enriched.evaluation.code).toBe("RED_URGENT");
    expect(enriched.evaluation.hex).toBe("#E53E3E");
  });

  it("debe incrementar el stock total del producto al registrar múltiples lotes", () => {
    BatchService.registerQuickEntry({
      sku: "SKU-ARROZ-1KG",
      batch_number: "LOTE-A",
      quantity: 30,
      operator_name: "Voluntaria Ana",
    });

    const second = BatchService.registerQuickEntry({
      sku: "SKU-ARROZ-1KG",
      batch_number: "LOTE-B",
      quantity: 20,
      operator_name: "Voluntario Pedro",
    });

    expect(second.product.currentTotalStock).toBe(50);
    const activeBatches = BatchService.getActiveBatchesWithEvaluation(second.productId);
    expect(activeBatches.length).toBe(2);
  });
});

