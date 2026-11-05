import { db } from "./client";
import { BatchService } from "../services/batch-service";

export function seedInitialData() {
  db.clearAll();

  const now = new Date();

  // 1. Producto Perecedero: Leche Entera
  // Lote 1: Rojo Urgente (Vence en 24 horas)
  BatchService.registerQuickEntry({
    sku: "7751234567890",
    product_name: "Leche Entera UHT 1L",
    batch_number: "LOTE-LECHE-URGENTE",
    quantity: 15,
    expiration_date: new Date(now.getTime() + 24 * 3600 * 1000).toISOString().split("T")[0],
    operator_name: "Voluntario Sembrado",
  });

  // Lote 2: Amarillo Precaución (Vence en 5 días)
  BatchService.registerQuickEntry({
    sku: "7751234567890",
    product_name: "Leche Entera UHT 1L",
    batch_number: "LOTE-LECHE-MEDIO",
    quantity: 30,
    expiration_date: new Date(now.getTime() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
    operator_name: "Voluntario Sembrado",
  });

  // Lote 3: Verde Seguro (Vence en 20 días)
  BatchService.registerQuickEntry({
    sku: "7751234567890",
    product_name: "Leche Entera UHT 1L",
    batch_number: "LOTE-LECHE-FRESCO",
    quantity: 50,
    expiration_date: new Date(now.getTime() + 20 * 24 * 3600 * 1000).toISOString().split("T")[0],
    operator_name: "Voluntario Sembrado",
  });

  // 2. Producto Perecedero: Yogur Natural
  // Lote Rojo (<48h)
  BatchService.registerQuickEntry({
    sku: "7759876543210",
    product_name: "Yogur Probiótico 1kg",
    batch_number: "YOG-2026-RED",
    quantity: 12,
    expiration_date: new Date(now.getTime() + 36 * 3600 * 1000).toISOString().split("T")[0],
    operator_name: "Voluntario Sembrado",
  });

  // 3. Producto No Perecedero: Arroz Extra
  // Verde Seguro (Sin vencimiento, FIFO por entrada)
  BatchService.registerQuickEntry({
    sku: "7750001112223",
    product_name: "Arroz Extra Seleccionado 1kg",
    batch_number: "ARROZ-LOTE-01",
    quantity: 100,
    operator_name: "Voluntario Sembrado",
  });

  BatchService.registerQuickEntry({
    sku: "7750001112223",
    product_name: "Arroz Extra Seleccionado 1kg",
    batch_number: "ARROZ-LOTE-02",
    quantity: 150,
    operator_name: "Voluntario Sembrado",
  });

  console.log("Seeding completado con 6 lotes en categorías Rojo, Amarillo y Verde.");
}

// Ejecutar si se llama directamente con node
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  seedInitialData();
}

