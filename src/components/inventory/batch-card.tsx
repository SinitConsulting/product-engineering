import React from "react";
import { ColorBadge } from "@/components/ui/badge";
import { ColorCode } from "@/lib/fifo/color-rules";
import { Box, Calendar, Clock, Barcode } from "lucide-react";

export interface BatchCardData {
  id: string;
  sku: string;
  product_name: string;
  batch_number: string;
  available_quantity: number;
  unit: string;
  expiration_date: string | null;
  color_code: ColorCode;
  color_hex: string;
  urgency_label: string;
  icon: string;
  entry_date: string;
}

interface BatchCardProps {
  batch: BatchCardData;
}

export function BatchCard({ batch }: BatchCardProps) {
  const isUrgent = batch.color_code === "RED_URGENT";

  return (
    <div
      className={`p-5 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md bg-white ${
        isUrgent ? "border-[#E53E3E] ring-2 ring-red-100" : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 mb-0.5">
            <Barcode className="w-3.5 h-3.5" />
            <span>{batch.sku}</span>
          </div>
          <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight leading-snug">
            {batch.product_name}
          </h3>
        </div>
        <ColorBadge colorCode={batch.color_code} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-100 my-3 bg-zinc-50/50 rounded-xl px-3">
        <div>
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Lote Físico</span>
          <span className="text-sm font-mono font-bold text-zinc-800">{batch.batch_number}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Stock Disponible</span>
          <span className="text-lg font-black text-blue-700">
            {batch.available_quantity} <span className="text-xs font-medium text-zinc-500">{batch.unit}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-600 font-medium pt-1">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>Vence: <strong>{batch.expiration_date ? batch.expiration_date.split("T")[0] : "No Perecedero"}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <Clock className="w-3 h-3" />
          <span>Ingreso: {new Date(batch.entry_date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

