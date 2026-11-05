import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  category: "PERISHABLE" | "NON_PERISHABLE";
  unit: string;
  currentTotalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBatchRecord {
  id: string;
  productId: string;
  batchNumber: string;
  initialQuantity: number;
  availableQuantity: number;
  expirationDate: string | null;
  status: "ACTIVE" | "DEPLETED" | "SCRAPPED";
  colorCode: "RED_URGENT" | "YELLOW_WARNING" | "GREEN_SAFE";
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransactionRecord {
  id: string;
  batchId: string;
  transactionType: "ENTRY" | "DISPATCH" | "ADJUSTMENT_SCRAP";
  quantity: number;
  balanceAfter: number;
  reason: string | null;
  operatorName: string;
  transactionDate: string;
  createdAt: string;
}

export interface DatabaseState {
  products: ProductRecord[];
  batches: InventoryBatchRecord[];
  transactions: InventoryTransactionRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "inventory-store.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

class InventoryDatabase {
  private state: DatabaseState = {
    products: [],
    batches: [],
    transactions: [],
  };
  private isLoaded = false;

  constructor() {
    this.load();
  }

  private load() {
    ensureDirectoryExists();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.state = JSON.parse(raw);
      } catch {
        this.state = { products: [], batches: [], transactions: [] };
      }
    } else {
      this.save();
    }
    this.isLoaded = true;
  }

  private save() {
    ensureDirectoryExists();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), "utf-8");
  }

  public getProducts(): ProductRecord[] {
    return [...this.state.products];
  }

  public findProductBySku(sku: string): ProductRecord | undefined {
    return this.state.products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
  }

  public findProductById(id: string): ProductRecord | undefined {
    return this.state.products.find((p) => p.id === id);
  }

  public upsertProduct(data: { sku: string; name?: string; category?: "PERISHABLE" | "NON_PERISHABLE"; unit?: string }): ProductRecord {
    const existing = this.findProductBySku(data.sku);
    const now = new Date().toISOString();
    if (existing) {
      if (data.name && existing.name !== data.name) {
        existing.name = data.name;
        existing.updatedAt = now;
        this.save();
      }
      return existing;
    }

    const newProd: ProductRecord = {
      id: crypto.randomUUID(),
      sku: data.sku,
      name: data.name || `Producto ${data.sku}`,
      category: data.category || (data.sku.startsWith("7") ? "PERISHABLE" : "NON_PERISHABLE"),
      unit: data.unit || "UNIDAD",
      currentTotalStock: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.state.products.push(newProd);
    this.save();
    return newProd;
  }

  public getBatches(filter?: { productId?: string; status?: string }): InventoryBatchRecord[] {
    return this.state.batches.filter((b) => {
      if (filter?.productId && b.productId !== filter.productId) return false;
      if (filter?.status && b.status !== filter.status) return false;
      return true;
    });
  }

  public findBatchById(id: string): InventoryBatchRecord | undefined {
    return this.state.batches.find((b) => b.id === id);
  }

  public createBatch(data: {
    productId: string;
    batchNumber: string;
    quantity: number;
    expirationDate?: string | null;
    operatorName: string;
  }): InventoryBatchRecord {
    const now = new Date().toISOString();
    const batchId = crypto.randomUUID();

    const batch: InventoryBatchRecord = {
      id: batchId,
      productId: data.productId,
      batchNumber: data.batchNumber,
      initialQuantity: data.quantity,
      availableQuantity: data.quantity,
      expirationDate: data.expirationDate || null,
      status: "ACTIVE",
      colorCode: "GREEN_SAFE",
      entryDate: now,
      createdAt: now,
      updatedAt: now,
    };

    const transaction: InventoryTransactionRecord = {
      id: crypto.randomUUID(),
      batchId: batchId,
      transactionType: "ENTRY",
      quantity: data.quantity,
      balanceAfter: data.quantity,
      reason: "Registro Rápido de Entrada",
      operatorName: data.operatorName,
      transactionDate: now,
      createdAt: now,
    };

    this.state.batches.push(batch);
    this.state.transactions.push(transaction);

    // Actualizar stock del producto
    const product = this.findProductById(data.productId);
    if (product) {
      product.currentTotalStock += data.quantity;
      product.updatedAt = now;
    }

    this.save();
    return batch;
  }

  public deductFromBatch(batchId: string, quantity: number, operatorName: string, reason?: string | null): InventoryBatchRecord {
    const batch = this.findBatchById(batchId);
    if (!batch) throw new Error(`Lote no encontrado: ${batchId}`);
    if (batch.availableQuantity < quantity) {
      throw new Error(`Stock insuficiente en el lote ${batch.batchNumber}: disponible ${batch.availableQuantity}, solicitado ${quantity}`);
    }

    const now = new Date().toISOString();
    batch.availableQuantity -= quantity;
    if (batch.availableQuantity === 0) {
      batch.status = "DEPLETED";
    }
    batch.updatedAt = now;

    const transaction: InventoryTransactionRecord = {
      id: crypto.randomUUID(),
      batchId: batchId,
      transactionType: "DISPATCH",
      quantity: quantity,
      balanceAfter: batch.availableQuantity,
      reason: reason || "Despacho FIFO",
      operatorName: operatorName,
      transactionDate: now,
      createdAt: now,
    };

    this.state.transactions.push(transaction);

    // Actualizar stock del producto
    const product = this.findProductById(batch.productId);
    if (product) {
      product.currentTotalStock -= quantity;
      product.updatedAt = now;
    }

    this.save();
    return batch;
  }

  public clearAll() {
    this.state = { products: [], batches: [], transactions: [] };
    this.save();
  }
}

// Singleton export
export const db = new InventoryDatabase();
