import { describe, it, expect } from "vitest";
import { FifoCalculator } from "@/lib/fifo/calculator";
import { EnrichedBatch } from "@/lib/services/batch-service";
import { evaluateBatchColor } from "@/lib/fifo/color-rules";

describe("FifoCalculator - Ordenamiento, Sugerencia y Bloqueo FIFO (US2)", () => {
  const refDate = new Date("2026-11-04T12:00:00Z");

  const mockProduct = {
    id: "prod-1",
    sku: "SKU-LECHE",
    name: "Leche Entera",
    category: "PERISHABLE" as const,
    unit: "UNIDAD",
    currentTotalStock: 40,
    createdAt: "2026-11-01T00:00:00Z",
    updatedAt: "2026-11-01T00:00:00Z",
  };

  const batchRed: EnrichedBatch = {
    id: "batch-red",
    productId: "prod-1",
    batchNumber: "LOTE-ROJO",
    initialQuantity: 10,
    availableQuantity: 10,
    expirationDate: "2026-11-05T00:00:00Z", // <48h -> Rojo
    status: "ACTIVE",
    colorCode: "RED_URGENT",
    entryDate: "2026-11-03T10:00:00Z",
    createdAt: "2026-11-03T10:00:00Z",
    updatedAt: "2026-11-03T10:00:00Z",
    evaluation: evaluateBatchColor("2026-11-05T00:00:00Z", refDate),
    product: mockProduct,
  };

  const batchGreen: EnrichedBatch = {
    id: "batch-green",
    productId: "prod-1",
    batchNumber: "LOTE-VERDE",
    initialQuantity: 30,
    availableQuantity: 30,
    expirationDate: "2026-11-20T00:00:00Z", // >7d -> Verde
    status: "ACTIVE",
    colorCode: "GREEN_SAFE",
    entryDate: "2026-11-01T10:00:00Z", // Entró antes, pero su vencimiento es lejano
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    evaluation: evaluateBatchColor("2026-11-20T00:00:00Z", refDate),
    product: mockProduct,
  };

  it("debe ordenar primero el lote Rojo Urgente aunque el lote Verde haya ingresado antes al almacén", () => {
    const sorted = FifoCalculator.sortBatchesFifo([batchGreen, batchRed]);
    expect(sorted[0].id).toBe("batch-red");
    expect(sorted[1].id).toBe("batch-green");
  });

  it("debe calcular el plan de despacho preseleccionando el lote prioritario", () => {
    const plan = FifoCalculator.calculateDispatchPlan([batchGreen, batchRed], 8, "SKU-LECHE", "Leche Entera");

    expect(plan.isSufficient).toBe(true);
    expect(plan.allocations.length).toBe(1);
    expect(plan.allocations[0].batchId).toBe("batch-red");
    expect(plan.allocations[0].deductQuantity).toBe(8);
    expect(plan.allocations[0].balanceAfter).toBe(2);
    expect(plan.allocations[0].isPriorityFifo).toBe(true);
  });

  it("debe detectar violación FIFO si el usuario intenta despachar el lote verde habiendo lote rojo disponible", () => {
    const violation = FifoCalculator.detectFifoViolation([batchRed, batchGreen], ["batch-green"]);
    expect(violation.isViolation).toBe(true);
    expect(violation.priorityBatchSuggested?.id).toBe("batch-red");
  });

  it("no debe reportar violación si se despacha el lote sugerido por FIFO", () => {
    const violation = FifoCalculator.detectFifoViolation([batchRed, batchGreen], ["batch-red"]);
    expect(violation.isViolation).toBe(false);
  });
});

