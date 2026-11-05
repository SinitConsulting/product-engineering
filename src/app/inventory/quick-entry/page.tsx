"use client";

import React, { useState } from "react";
import { ScannerInput } from "@/components/inventory/scanner-input";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/badge";
import { ColorCode } from "@/lib/fifo/color-rules";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function QuickEntryPage() {
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantity, setQuantity] = useState("50");
  const [expirationDate, setExpirationDate] = useState("");
  const [operatorName, setOperatorName] = useState("Voluntario Activo");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
    colorCode?: ColorCode;
    batchNumber?: string;
  } | null>(null);

  const handleScan = (scannedSku: string) => {
    setSku(scannedSku);
    // Asignar sugerencia de número de lote automático
    if (!batchNumber) {
      const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
      setBatchNumber(`LOT-${today}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !batchNumber.trim() || !quantity) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/inventory/quick-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: sku.trim(),
          product_name: productName.trim() || undefined,
          batch_number: batchNumber.trim(),
          quantity: parseInt(quantity, 10),
          expiration_date: expirationDate || null,
          operator_name: operatorName.trim() || "Voluntario",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({
          success: true,
          message: `Lote ${data.data.batch.batch_number} guardado con éxito.`,
          colorCode: data.data.batch.color_code,
          batchNumber: data.data.batch.batch_number,
        });

        // Limpiar para siguiente escaneo continuo
        setSku("");
        setBatchNumber("");
        setExpirationDate("");
      } else {
        setFeedback({
          success: false,
          message: data.message || "Error al registrar lote.",
        });
      }
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || "Error de conexión con el servidor.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <Link href="/inventory/dashboard" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mb-1">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Tablero
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Registro Rápido de Entrada
          </h1>
          <p className="text-sm text-zinc-600 font-medium">
            Entrada híbrida optimizada para lectores de código de barras y teclado
          </p>
        </div>
      </div>

      {/* Banner de Feedback Semáforo */}
      {feedback && (
        <div
          className={`p-4 rounded-xl mb-6 border-2 flex items-center justify-between ${
            feedback.success ? "bg-emerald-50 border-emerald-500" : "bg-red-50 border-[#E53E3E]"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.success ? (
              <CheckCircle2 className="w-6 h-6 text-[#38A169] flex-shrink-0" />
            ) : (
              <RotateCcw className="w-6 h-6 text-[#E53E3E] flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-zinc-900 text-base">{feedback.message}</p>
              {feedback.colorCode && (
                <div className="mt-1">
                  <ColorBadge colorCode={feedback.colorCode} size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formulario Ágil */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <ScannerInput
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onScanComplete={handleScan}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-zinc-800 mb-1">
              Nombre de Producto (Opcional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej. Leche Entera 1L"
              className="w-full min-h-[48px] px-3.5 py-2 text-base rounded-xl border border-zinc-300 focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-800 mb-1">
              Nº de Lote <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Ej. LOTE-A1"
              required
              className="w-full min-h-[48px] px-3.5 py-2 text-base font-mono rounded-xl border border-zinc-300 focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-zinc-800 mb-1">
              Cantidad Entrante <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full min-h-[48px] px-3.5 py-2 text-lg font-bold rounded-xl border border-zinc-300 focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-800 mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full min-h-[48px] px-3.5 py-2 text-base rounded-xl border border-zinc-300 focus:ring-4 focus:ring-blue-100 outline-none"
            />
            <span className="text-xs text-zinc-500">Dejar vacío si no es perecedero</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-800 mb-1">
            Operador / Voluntario
          </label>
          <input
            type="text"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            className="w-full min-h-[48px] px-3.5 py-2 text-base rounded-xl border border-zinc-300 focus:ring-4 focus:ring-blue-100 outline-none"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading}>
            {isLoading ? "Registrando Lote..." : "Guardar Entrada (Enter)"}
          </Button>
        </div>
      </form>
    </div>
  );
}

