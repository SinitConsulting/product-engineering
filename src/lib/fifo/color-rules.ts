export type ColorCode = "RED_URGENT" | "YELLOW_WARNING" | "GREEN_SAFE";

export interface ColorEvaluation {
  code: ColorCode;
  hex: string;
  label: string;
  priority: 1 | 2 | 3;
  hoursRemaining: number | null;
  iconName: "AlertTriangle" | "RotateCw" | "Box";
  badgeClass: string;
}

export const COLOR_CONFIG = {
  RED_URGENT: {
    hex: "#E53E3E",
    label: "🔴 URGENTE (<48h)",
    priority: 1 as const,
    iconName: "AlertTriangle" as const,
    badgeClass: "bg-[#E53E3E] text-white border-red-700",
  },
  YELLOW_WARNING: {
    hex: "#D69E2E",
    label: "🟡 PRECAUCIÓN (3-7d)",
    priority: 2 as const,
    iconName: "RotateCw" as const,
    badgeClass: "bg-[#D69E2E] text-zinc-950 border-amber-600 font-bold",
  },
  GREEN_SAFE: {
    hex: "#38A169",
    label: "🟢 SEGURO (>7d / No Perecedero)",
    priority: 3 as const,
    iconName: "Box" as const,
    badgeClass: "bg-[#38A169] text-white border-emerald-700",
  },
} as const;

/**
 * Evalúa el código de color y nivel de urgencia de un lote según su fecha de vencimiento y fecha actual.
 * @param expirationDate Fecha de vencimiento (Date o string ISO), null o undefined si es no perecedero
 * @param referenceDate Fecha de referencia (por defecto: now)
 */
export function evaluateBatchColor(
  expirationDate?: Date | string | null,
  referenceDate: Date = new Date()
): ColorEvaluation {
  if (!expirationDate) {
    return {
      code: "GREEN_SAFE",
      ...COLOR_CONFIG.GREEN_SAFE,
      hoursRemaining: null,
    };
  }

  const exp = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
  const diffMs = exp.getTime() - referenceDate.getTime();
  const hoursRemaining = diffMs / (1000 * 60 * 60);

  // Menor o igual a 48 horas (incluyendo vencidos)
  if (hoursRemaining <= 48) {
    return {
      code: "RED_URGENT",
      ...COLOR_CONFIG.RED_URGENT,
      hoursRemaining,
    };
  }

  // Entre 48 horas y 7 días (168 horas)
  if (hoursRemaining <= 168) {
    return {
      code: "YELLOW_WARNING",
      ...COLOR_CONFIG.YELLOW_WARNING,
      hoursRemaining,
    };
  }

  // Mayor a 7 días
  return {
    code: "GREEN_SAFE",
    ...COLOR_CONFIG.GREEN_SAFE,
    hoursRemaining,
  };
}

