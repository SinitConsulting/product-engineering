"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOverride: (reason: string) => void;
  warningMessage: string;
  suggestedBatchNumber?: string;
}

export function DispatchModal({
  isOpen,
  onClose,
  onConfirmOverride,
  warningMessage,
  suggestedBatchNumber,
}: DispatchModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim().length < 10) {
      setError("La justificación debe tener al menos 10 caracteres.");
      return;
    }
    setError("");
    onConfirmOverride(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-4 border-[#E53E3E] animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl text-[#E53E3E]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                ⚠️ Violación FIFO Detectada
              </h2>
              <p className="text-sm text-red-600 font-bold">
                Advertencia Obligatoria de Almacén
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-4">
          <p className="text-sm text-zinc-800 font-medium leading-relaxed">
            {warningMessage}
          </p>
          {suggestedBatchNumber && (
            <p className="mt-2 text-sm font-bold text-red-800">
              Lote recomendado para salida: <span className="font-mono bg-white px-2 py-0.5 rounded border border-red-300">{suggestedBatchNumber}</span>
            </p>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold text-zinc-800 mb-1">
            Motivo de la Excepción <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            placeholder="Explique por qué omite el lote prioritario (ej. lote en cuarentena, daño físico en tarima...)"
            rows={3}
            className="w-full p-3 rounded-xl border-2 border-zinc-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none text-sm"
          />
          {error && <p className="text-xs font-bold text-red-600 mt-1">{error}</p>}
          <p className="text-xs text-zinc-500 mt-1">Mínimo 10 caracteres requeridos para auditoría.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onClose} fullWidth>
            Cancelar y Usar FIFO
          </Button>
          <Button variant="danger" onClick={handleConfirm} fullWidth>
            Autorizar Salida con Motivo
          </Button>
        </div>
      </div>
    </div>
  );
}

