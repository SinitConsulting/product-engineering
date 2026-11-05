import { db } from "@/lib/db/client";
import { BatchService } from "@/lib/services/batch-service";
import { FifoCalculator, DispatchPlan } from "@/lib/fifo/calculator";
import { DispatchInput } from "@/lib/validators/inventory-schemas";

export class DispatchService {
  public static getSuggestedPlan(sku: string, quantity: number): DispatchPlan {
    const product = db.findProductBySku(sku);
    if (!product) {
      throw new Error(`Producto no encontrado con SKU: ${sku}`);
    }

    const activeBatches = BatchService.getActiveBatchesWithEvaluation(product.id);
    return FifoCalculator.calculateDispatchPlan(activeBatches, quantity, product.sku, product.name);
  }

  public static executeDispatch(input: DispatchInput) {
    const product = db.findProductBySku(input.sku);
    if (!product) {
      throw new Error(`Producto no encontrado con SKU: ${input.sku}`);
    }

    const activeBatches = BatchService.getActiveBatchesWithEvaluation(product.id);
    const selectedBatchIds = input.allocations.map((a) => a.batch_id);

    // 1. Validar regla de excepción FIFO
    const violationCheck = FifoCalculator.detectFifoViolation(activeBatches, selectedBatchIds);
    if (violationCheck.isViolation && !input.force_override) {
      const suggested = violationCheck.priorityBatchSuggested!;
      return {
        success: false,
        isViolation: true,
        message: `Violación FIFO detectada: El lote ${suggested.batchNumber} (${suggested.evaluation.label}) tiene prioridad obligatoria de salida.`,
        suggestedBatch: suggested,
      };
    }

    // 2. Ejecutar deducciones atómicas
    const processedBatches = [];
    for (const alloc of input.allocations) {
      const updated = db.deductFromBatch(
        alloc.batch_id,
        alloc.quantity,
        input.operator_name,
        input.force_override ? `EXCEPCIÓN FIFO: ${input.override_reason}` : "Despacho FIFO Asistido"
      );
      processedBatches.push(updated);
    }

    const updatedProduct = db.findProductById(product.id)!;

    return {
      success: true,
      isViolation: false,
      message: "Despacho procesado exitosamente.",
      product: {
        sku: updatedProduct.sku,
        name: updatedProduct.name,
        remaining_stock: updatedProduct.currentTotalStock,
      },
      deductions: input.allocations,
    };
  }
}

