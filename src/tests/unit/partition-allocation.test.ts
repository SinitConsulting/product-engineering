import { describe, it, expect, beforeEach } from "vitest";
import { FifoCalculator } from "@/lib/fifo/calculator";
import { EnrichedBatch } from "@/lib/services/batch-service";
import { evaluateBatchColor } from "@/lib/fifo/color-rules";
import { db } from "@/lib/db/client";
import { BatchService } from "@/lib/services/batch-service";
import { DispatchService } from "@/lib/services/dispatch-service";

describe("Partición Automática Multilote (US4)", () => {
  beforeEach(() => {
    db.clearAll();
  });

  it("debe dividir automáticamente el requerimiento cuando supera el stock del primer lote FIFO", () => {
    const mockProduct = {
      id: "prod-100",
      sku: "SKU-ARROZ",
      name: "Arroz Extra 1kg",
      category: "NON_PERISHABLE" as const,
      unit: "KG",
      currentTotalStock: 30,
      createdAt: "2026-11-01T00:00:00Z",
      updatedAt: "2026-11-01T00:00:00Z",
    };

    // Lote 1: 10 unidades (entró primero)
    const batch1: EnrichedBatch = {
      id: "b-1",
      productId: "prod-100",
      batchNumber: "LOTE-001",
      initialQuantity: 10,
      availableQuantity: 10,
      expirationDate: null,
      status: "ACTIVE",
      colorCode: "GREEN_SAFE",
      entryDate: "2026-11-01T08:00:00Z",
      createdAt: "2026-11-01T08:00:00Z",
      updatedAt: "2026-11-01T08:00:00Z",
      evaluation: evaluateBatchColor(null),
      product: mockProduct,
    };

    // Lote 2: 20 unidades (entró después)
    const batch2: EnrichedBatch = {
      id: "b-2",
      productId: "prod-100",
      batchNumber: "LOTE-002",
      initialQuantity: 20,
      availableQuantity: 20,
      expirationDate: null,
      status: "ACTIVE",
      colorCode: "GREEN_SAFE",
      entryDate: "2026-11-01T09:00:00Z",
      createdAt: "2026-11-01T09:00:00Z",
      updatedAt: "2026-11-01T09:00:00Z",
      evaluation: evaluateBatchColor(null),
      product: mockProduct,
    };

    // Solicitamos 15 unidades (debe agotar las 10 de b-1 y tomar 5 de b-2)
    const plan = FifoCalculator.calculateDispatchPlan([batch1, batch2], 15, "SKU-ARROZ", "Arroz Extra 1kg");

    expect(plan.isSufficient).toBe(true);
    expect(plan.allocations.length).toBe(2);

    expect(plan.allocations[0].batchId).toBe("b-1");
    expect(plan.allocations[0].deductQuantity).toBe(10);
    expect(plan.allocations[0].balanceAfter).toBe(0);

    expect(plan.allocations[1].batchId).toBe("b-2");
    expect(plan.allocations[1].deductQuantity).toBe(5);
    expect(plan.allocations[1].balanceAfter).toBe(15);
  });

  it("debe ejecutar la partición atómica en base de datos descontando exactamente de ambos lotes", () => {
    // 1. Ingresar dos lotes
    const b1 = BatchService.registerQuickEntry({
      sku: "SKU-ACEITE",
      batch_number: "ACEITE-L1",
      quantity: 10,
      operator_name: "Operador Entrada",
    });

    const b2 = BatchService.registerQuickEntry({
      sku: "SKU-ACEITE",
      batch_number: "ACEITE-L2",
      quantity: 20,
      operator_name: "Operador Entrada",
    });

    // 2. Ejecutar despacho de 15 unidades desglosado
    const result = DispatchService.executeDispatch({
      sku: "SKU-ACEITE",
      quantity: 15,
      operator_name: "Despachador",
      force_override: false,
      allocations: [
        { batch_id: b1.id, quantity: 10 },
        { batch_id: b2.id, quantity: 5 },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.product?.remaining_stock).toBe(15);

    const b1Db = db.findBatchById(b1.id)!;
    const b2Db = db.findBatchById(b2.id)!;

    expect(b1Db.availableQuantity).toBe(0);
    expect(b1Db.status).toBe("DEPLETED");

    expect(b2Db.availableQuantity).toBe(15);
    expect(b2Db.status).toBe("ACTIVE");
  });
});

