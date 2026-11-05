"use client";

import React, { useEffect, useState } from "react";
import { BatchCard, BatchCardData } from "@/components/inventory/batch-card";
import { Button } from "@/components/ui/button";
import { ColorCode } from "@/lib/fifo/color-rules";
import { PlusCircle, ArrowUpRight, Search, RefreshCw, AlertTriangle, RotateCw, Box } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  summary: {
    totalBatchesActive: number;
    redUrgentCount: number;
    yellowWarningCount: number;
    greenSafeCount: number;
    totalProductsCount: number;
  };
  batches: BatchCardData[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeFilter, setActiveFilter] = useState<ColorCode | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (activeFilter !== "ALL") query.set("color_filter", activeFilter);
      if (search.trim()) query.set("search", search.trim());

      const res = await fetch(`/api/inventory/dashboard?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboard();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Barra Superior con Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Operaciones de Almacén</span>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Control de Inventario FIFO
          </h1>
          <p className="text-sm text-zinc-600 font-medium">
            Sistema semáforo de urgencia y despacho asistido para voluntarios
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link href="/inventory/quick-entry">
            <Button variant="primary" size="md">
              <PlusCircle className="w-5 h-5 mr-2" />
              Registro Rápido (Entrada)
            </Button>
          </Link>
          <Link href="/inventory/dispatch">
            <Button variant="warning" size="md">
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Despacho Asistido (Salida)
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas Resumen Semáforo */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              activeFilter === "ALL" ? "border-blue-600 bg-blue-50/50 shadow-md" : "border-zinc-200 bg-white hover:border-zinc-300"
            }`}
          >
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Total Lotes Activos</span>
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1 block">
              {data.summary.totalBatchesActive}
            </span>
            <span className="text-xs text-zinc-400 mt-1 block">{data.summary.totalProductsCount} artículos</span>
          </button>

          <button
            onClick={() => setActiveFilter("RED_URGENT")}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              activeFilter === "RED_URGENT"
                ? "border-[#E53E3E] bg-red-50 shadow-md ring-2 ring-red-200"
                : "border-red-200 bg-red-50/40 hover:border-red-300"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E53E3E] uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Rojo Urgente (&lt;48h)</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#E53E3E] mt-1 block">
              {data.summary.redUrgentCount}
            </span>
            <span className="text-xs font-bold text-red-700 mt-1 block">Prioridad Absoluta</span>
          </button>

          <button
            onClick={() => setActiveFilter("YELLOW_WARNING")}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              activeFilter === "YELLOW_WARNING"
                ? "border-[#D69E2E] bg-amber-50 shadow-md ring-2 ring-amber-200"
                : "border-amber-200 bg-amber-50/40 hover:border-amber-300"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D69E2E] uppercase tracking-wider">
              <RotateCw className="w-4 h-4" />
              <span>Precaución (3-7d)</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#D69E2E] mt-1 block">
              {data.summary.yellowWarningCount}
            </span>
            <span className="text-xs font-bold text-amber-700 mt-1 block">Rotación Próxima</span>
          </button>

          <button
            onClick={() => setActiveFilter("GREEN_SAFE")}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              activeFilter === "GREEN_SAFE"
                ? "border-[#38A169] bg-emerald-50 shadow-md ring-2 ring-emerald-200"
                : "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#38A169] uppercase tracking-wider">
              <Box className="w-4 h-4" />
              <span>Seguro (&gt;7d / No Per.)</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#38A169] mt-1 block">
              {data.summary.greenSafeCount}
            </span>
            <span className="text-xs font-bold text-emerald-700 mt-1 block">Stock Estable</span>
          </button>
        </div>
      )}

      {/* Buscador de Lotes y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por SKU, producto o lote..."
            className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-zinc-300 focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
        </form>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={fetchDashboard} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Listado de Tarjetas de Lotes */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-semibold">Cargando inventario FIFO...</p>
        </div>
      ) : data && data.batches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.batches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-zinc-200">
          <Box className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-zinc-800">No se encontraron lotes activos</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Utiliza el registro rápido para dar de alta nuevos productos y lotes en almacén.
          </p>
          <Link href="/inventory/quick-entry">
            <Button variant="primary" size="md">
              <PlusCircle className="w-4 h-4 mr-2" /> Registrar Primer Lote
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

