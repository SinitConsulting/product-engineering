"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/badge";
import { DispatchModal } from "@/components/inventory/dispatch-modal";
import { DispatchPlan } from "@/lib/fifo/calculator";
import { ArrowLeft, CheckCircle2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DispatchPage() {
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [operatorName, setOperatorName] = useState("Voluntario Despacho");
  const [plan, setPlan] = useState<DispatchPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal de advertencia FIFO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingViolation, setPendingViolation] = useState<{
    message: string;
    suggestedBatchNumber?: string;
  } | null>(null);

  const handleSearchPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !quantity) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    setPlan(null);

    try {
      const res = await fetch(`/api/inventory/suggest-dispatch?sku=${encodeURIComponent(sku.trim())}&quantity=${parseInt(quantity, 10)}`);
      const data = await res.json();

      if (data.success) {
        setPlan(data.data);
      } else {
        setError(data.message || "Producto no encontrado o sin existencias.");
      }
    } catch (err: any) {
      setError(err.message || "Error al consultar plan FIFO.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteDispatch = async (forceOverride = false, overrideReason?: string) => {
    if (!plan || plan.allocations.length === 0) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/inventory/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: plan.sku,
          quantity: plan.requestedQuantity,
          operator_name: operatorName.trim() || "Voluntario",
          force_override: forceOverride,
          override_reason: overrideReason || null,
          allocations: plan.allocations.map((a) => ({
            batch_id: a.batchId,
            quantity: a.deductQuantity,
          })),
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Violación FIFO detectada
        setPendingViolation({
          message: data.message,
          suggestedBatchNumber: data.suggested_batch?.batchNumber,
        });
        setIsModalOpen(true);
        return;
      }

      if (data.success) {
        setSuccessMessage(`Salida de ${plan.requestedQuantity} unidades procesada con éxito.`);
        setPlan(null);
        setSku("");
        setIsModalOpen(false);
      } else {
        setError(data.message || "Error al ejecutar despacho.");
      }
    } catch (err: any) {
      setError(err.message || "Error de red al procesar salida.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <Link href="/inventory/dashboard" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mb-1">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Tablero
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Despacho Asistido FIFO
          </h1>
          <p className="text-sm text-zinc-600 font-medium">
            Preselección automática por urgencia semáforo y protección contra errores de salida
          </p>
        </div>
      </div>

      {/* Banner de Éxito o Error */}
      {successMessage && (
        <div className="p-4 rounded-xl mb-6 bg-emerald-50 border-2 border-emerald-500 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-[#38A169] flex-shrink-0" />
          <p className="font-bold text-zinc-900 text-base">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl mb-6 bg-red-50 border-2 border-[#E53E3E] text-red-900 font-bold">
          {error}
        </div>
      )}

      {/* Búsqueda de Producto y Cantidad */}
      <form onSubmit={handleSearchPlan} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-zinc-800 mb-1">
              Código de Barra o SKU a Despachar
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Ej. 7751234567890"
              required
              className="w-full min-h-[48px] px-4 py-2 text-base font-mono rounded-xl border border-zinc-300 focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-800 mb-1">
              Cantidad a Retirar
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full min-h-[48px] px-4 py-2 text-lg font-bold rounded-xl border border-zinc-300 focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading}>
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? "Consultando Cola FIFO..." : "Calcular Sugerencia FIFO"}
        </Button>
      </form>

      {/* Plan de Despacho Sugerido */}
      {plan && (
        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-blue-200 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 gap-2">
            <div>
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Plan Sugerido por el Sistema</span>
              <h2 className="text-xl font-extrabold text-zinc-900">{plan.productName}</h2>
              <p className="text-sm font-mono text-zinc-500">SKU: {plan.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-semibold">Stock Total Disponible</p>
              <p className="text-2xl font-black text-zinc-900">{plan.availableTotal} unids.</p>
            </div>
          </div>

          {!plan.isSufficient && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl mb-4 text-amber-900 text-sm font-bold">
              ⚠️ El stock total ({plan.availableTotal}) es menor a la cantidad solicitada ({plan.requestedQuantity}). Solo se podrán despachar {plan.availableTotal} unidades.
            </div>
          )}

          {/* Lista de deducción por lotes */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
              Desglose de Lotes para Salida (Orden FIFO):
            </h3>

            {plan.allocations.map((alloc, idx) => (
              <div
                key={alloc.batchId}
                className="p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border-zinc-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-zinc-900">{alloc.batchNumber}</span>
                      <ColorBadge colorCode={alloc.colorCode as any} size="sm" />
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Vence: {alloc.expirationDate ? alloc.expirationDate.split("T")[0] : "No Perecedero"} | Disponible: {alloc.availableInBatch} unids.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-sm text-zinc-500 font-medium">Descontar:</span>
                  <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-base">
                    {alloc.deductQuantity} unids.
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-zinc-600 mb-1">
              Operador Responsable
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-1.5 text-sm rounded-xl border border-zinc-300 outline-none"
            />
          </div>

          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={() => handleExecuteDispatch(false)}
            disabled={isLoading || plan.allocations.length === 0}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            {isLoading ? "Procesando..." : "Confirmar Salida Asistida FIFO"}
          </Button>
        </div>
      )}

      {/* Modal de Advertencia de Violación FIFO */}
      <DispatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warningMessage={pendingViolation?.message || ""}
        suggestedBatchNumber={pendingViolation?.suggestedBatchNumber}
        onConfirmOverride={(reason) => handleExecuteDispatch(true, reason)}
      />
    </div>
  );
}

