import { db, InventoryBatchRecord, ProductRecord } from "@/lib/db/client";
import { evaluateBatchColor, ColorEvaluation } from "@/lib/fifo/color-rules";
import { QuickEntryInput } from "@/lib/validators/inventory-schemas";

export interface EnrichedBatch extends InventoryBatchRecord {
  evaluation: ColorEvaluation;
  product: ProductRecord;
}

export class BatchService {
  public static registerQuickEntry(input: QuickEntryInput): EnrichedBatch {
    // 1. Obtener o crear producto por SKU
    const product = db.upsertProduct({
      sku: input.sku,
      name: input.product_name,
      category: input.expiration_date ? "PERISHABLE" : "NON_PERISHABLE",
    });

    // 2. Crear lote
    const batch = db.createBatch({
      productId: product.id,
      batchNumber: input.batch_number,
      quantity: input.quantity,
      expirationDate: input.expiration_date || null,
      operatorName: input.operator_name,
    });

    // 3. Evaluar color semáforo
    const evaluation = evaluateBatchColor(batch.expirationDate);
    batch.colorCode = evaluation.code;

    return {
      ...batch,
      evaluation,
      product: db.findProductById(product.id) || product,
    };
  }

  public static getActiveBatchesWithEvaluation(productId?: string): EnrichedBatch[] {
    const batches = db.getBatches({ productId, status: "ACTIVE" });
    const now = new Date();

    return batches.map((batch) => {
      const product = db.findProductById(batch.productId)!;
      const evaluation = evaluateBatchColor(batch.expirationDate, now);
      batch.colorCode = evaluation.code;
      return {
        ...batch,
        evaluation,
        product,
      };
    });
  }
}

