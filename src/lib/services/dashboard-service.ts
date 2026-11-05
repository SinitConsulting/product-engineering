import { db } from "@/lib/db/client";
import { BatchService, EnrichedBatch } from "@/lib/services/batch-service";
import { ColorCode } from "@/lib/fifo/color-rules";

export interface DashboardSummary {
  totalBatchesActive: number;
  redUrgentCount: number;
  yellowWarningCount: number;
  greenSafeCount: number;
  totalProductsCount: number;
}

export class DashboardService {
  public static getDashboardData(colorFilter?: ColorCode | "ALL", searchQuery?: string) {
    const allBatches = BatchService.getActiveBatchesWithEvaluation();

    const summary: DashboardSummary = {
      totalBatchesActive: allBatches.length,
      redUrgentCount: allBatches.filter((b) => b.evaluation.code === "RED_URGENT").length,
      yellowWarningCount: allBatches.filter((b) => b.evaluation.code === "YELLOW_WARNING").length,
      greenSafeCount: allBatches.filter((b) => b.evaluation.code === "GREEN_SAFE").length,
      totalProductsCount: db.getProducts().length,
    };

    let filtered = allBatches;

    if (colorFilter && colorFilter !== "ALL") {
      filtered = filtered.filter((b) => b.evaluation.code === colorFilter);
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.product.name.toLowerCase().includes(q) ||
          b.product.sku.toLowerCase().includes(q) ||
          b.batchNumber.toLowerCase().includes(q)
      );
    }

    // Ordenar de forma predeterminada por urgencia semáforo
    filtered.sort((a, b) => a.evaluation.priority - b.evaluation.priority);

    return {
      summary,
      batches: filtered,
    };
  }
}

