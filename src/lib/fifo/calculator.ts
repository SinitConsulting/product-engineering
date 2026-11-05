import { EnrichedBatch } from "@/lib/services/batch-service";

export interface AllocationItem {
  batchId: string;
  batchNumber: string;
  colorCode: string;
  colorHex: string;
  expirationDate: string | null;
  availableInBatch: number;
  deductQuantity: number;
  balanceAfter: number;
  isPriorityFifo: boolean;
}

export interface DispatchPlan {
  sku: string;
  productName: string;
  requestedQuantity: number;
  availableTotal: number;
  isSufficient: boolean;
  allocations: AllocationItem[];
}

export class FifoCalculator {
  /**
   * Ordena los lotes según la política combinada de urgencia semáforo + FIFO cronológico.
   */
  public static sortBatchesFifo(batches: EnrichedBatch[]): EnrichedBatch[] {
    return [...batches].sort((a, b) => {
      // 1. Por prioridad semáforo (1 = Rojo, 2 = Amarillo, 3 = Verde)
      if (a.evaluation.priority !== b.evaluation.priority) {
        return a.evaluation.priority - b.evaluation.priority;
      }

      // 2. Por fecha de vencimiento más temprana (si ambos la tienen)
      if (a.expirationDate && b.expirationDate) {
        const diffExp = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        if (diffExp !== 0) return diffExp;
      } else if (a.expirationDate && !b.expirationDate) {
        return -1; // Perecedero sale antes que no perecedero
      } else if (!a.expirationDate && b.expirationDate) {
        return 1;
      }

      // 3. Desempate estricto por fecha/hora de ingreso (First-In, First-Out)
      return new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
    });
  }

  /**
   * Calcula el plan de deducción FIFO para una cantidad solicitada.
   */
  public static calculateDispatchPlan(
    batches: EnrichedBatch[],
    requestedQuantity: number,
    sku: string,
    productName: string
  ): DispatchPlan {
    const sorted = this.sortBatchesFifo(batches);
    const availableTotal = sorted.reduce((acc, b) => acc + b.availableQuantity, 0);
    const isSufficient = availableTotal >= requestedQuantity;

    let remainingToDeduct = requestedQuantity;
    const allocations: AllocationItem[] = [];

    for (let i = 0; i < sorted.length; i++) {
      if (remainingToDeduct <= 0) break;

      const batch = sorted[i];
      if (batch.availableQuantity <= 0) continue;

      const deduct = Math.min(remainingToDeduct, batch.availableQuantity);
      remainingToDeduct -= deduct;

      allocations.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        colorCode: batch.evaluation.code,
        colorHex: batch.evaluation.hex,
        expirationDate: batch.expirationDate,
        availableInBatch: batch.availableQuantity,
        deductQuantity: deduct,
        balanceAfter: batch.availableQuantity - deduct,
        isPriorityFifo: i === 0,
      });
    }

    return {
      sku,
      productName,
      requestedQuantity,
      availableTotal,
      isSufficient,
      allocations,
    };
  }

  /**
   * Valida si un despacho manual enviado viola la cola FIFO.
   */
  public static detectFifoViolation(
    allActiveBatches: EnrichedBatch[],
    selectedBatchIds: string[]
  ): { isViolation: boolean; priorityBatchSuggested?: EnrichedBatch } {
    const sorted = this.sortBatchesFifo(allActiveBatches);
    if (sorted.length === 0) return { isViolation: false };

    const highestPriorityBatch = sorted[0];

    // Si el lote con máxima prioridad no está entre los seleccionados, es una violación FIFO
    const isSelected = selectedBatchIds.includes(highestPriorityBatch.id);
    if (!isSelected && highestPriorityBatch.availableQuantity > 0) {
      return {
        isViolation: true,
        priorityBatchSuggested: highestPriorityBatch,
      };
    }

    return { isViolation: false };
  }
}

