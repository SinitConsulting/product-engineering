import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/client";
import { BatchService } from "@/lib/services/batch-service";
import { DashboardService } from "@/lib/services/dashboard-service";

describe("DashboardService - Semáforo Visual y Filtros (US3)", () => {
  beforeEach(() => {
    db.clearAll();
  });

  it("debe calcular los contadores globales del semáforo y filtrar lotes por color", () => {
    // 1 Lote Rojo (<48h)
    BatchService.registerQuickEntry({
      sku: "SKU-1",
      batch_number: "BATCH-RED",
      quantity: 10,
      expiration_date: new Date(Date.now() + 20 * 3600 * 1000).toISOString().split("T")[0],
      operator_name: "Admin",
    });

    // 1 Lote Amarillo (3-7d)
    BatchService.registerQuickEntry({
      sku: "SKU-2",
      batch_number: "BATCH-YELLOW",
      quantity: 20,
      expiration_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
      operator_name: "Admin",
    });

    // 2 Lotes Verdes (>7d)
    BatchService.registerQuickEntry({
      sku: "SKU-3",
      batch_number: "BATCH-GREEN-1",
      quantity: 30,
      expiration_date: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
      operator_name: "Admin",
    });

    BatchService.registerQuickEntry({
      sku: "SKU-4",
      batch_number: "BATCH-GREEN-2",
      quantity: 40,
      operator_name: "Admin", // No perecedero
    });

    const dataAll = DashboardService.getDashboardData("ALL");
    expect(dataAll.summary.totalBatchesActive).toBe(4);
    expect(dataAll.summary.redUrgentCount).toBe(1);
    expect(dataAll.summary.yellowWarningCount).toBe(1);
    expect(dataAll.summary.greenSafeCount).toBe(2);

    // Filtrar exclusivamente Rojo Urgente
    const dataRed = DashboardService.getDashboardData("RED_URGENT");
    expect(dataRed.batches.length).toBe(1);
    expect(dataRed.batches[0].batchNumber).toBe("BATCH-RED");
  });
});

