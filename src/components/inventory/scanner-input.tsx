"use client";

import React, { useEffect, useRef } from "react";
import { Barcode } from "lucide-react";

interface ScannerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onScanComplete?: (scannedValue: string) => void;
  label?: string;
  error?: string;
}

export function ScannerInput({
  onScanComplete,
  label = "Escanear Código de Barras / SKU",
  error,
  className = "",
  value,
  onChange,
  ...props
}: ScannerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  // Escaneo continuo con pistola lectora (detecta ráfaga <40ms por caracter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está enfocado en otro input que no sea este
      if (document.activeElement && document.activeElement !== inputRef.current && document.activeElement.tagName === "INPUT") {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (e.key === "Enter") {
        if (bufferRef.current.length >= 3 && timeDiff < 100) {
          // Detectado escaneo por hardware
          e.preventDefault();
          const scanned = bufferRef.current;
          bufferRef.current = "";
          if (onScanComplete) onScanComplete(scanned);
        }
      } else if (e.key.length === 1) {
        if (timeDiff > 200) {
          bufferRef.current = "";
        }
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScanComplete]);

  // Mantener autofoco en almacén
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-zinc-800 mb-1 tracking-wide flex items-center gap-1.5">
          <Barcode className="w-4 h-4 text-blue-600" />
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          className={`w-full min-h-[52px] px-4 py-2 text-lg font-mono tracking-wider rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-blue-100 ${
            error
              ? "border-[#E53E3E] bg-red-50 text-red-900"
              : "border-zinc-300 focus:border-blue-600 bg-white text-zinc-900"
          } ${className}`}
          placeholder="Escanee con lector o escriba SKU..."
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm font-semibold text-[#E53E3E]">{error}</p>}
    </div>
  );
}

