import { describe, it, expect } from "vitest";
import { evaluateBatchColor, COLOR_CONFIG } from "@/lib/fifo/color-rules";

describe("evaluateBatchColor - Reglas Semáforo de Marca (skills_marca)", () => {
  const referenceDate = new Date("2026-11-04T12:00:00Z");

  it("debe asignar ROJO URGENTE (#E53E3E) si el vencimiento es menor o igual a 48 horas", () => {
    // 24 horas restantes
    const expDate = new Date("2026-11-05T12:00:00Z");
    const result = evaluateBatchColor(expDate, referenceDate);

    expect(result.code).toBe("RED_URGENT");
    expect(result.hex).toBe("#E53E3E");
    expect(result.priority).toBe(1);
    expect(result.hoursRemaining).toBe(24);
    expect(result.iconName).toBe("AlertTriangle");
  });

  it("debe asignar ROJO URGENTE (#E53E3E) si el producto ya está vencido", () => {
    const expiredDate = new Date("2026-11-03T12:00:00Z"); // -24h
    const result = evaluateBatchColor(expiredDate, referenceDate);

    expect(result.code).toBe("RED_URGENT");
    expect(result.priority).toBe(1);
    expect(result.hoursRemaining).toBeLessThan(0);
  });

  it("debe asignar AMARILLO PRECAUCIÓN (#D69E2E) si el vencimiento es entre 3 y 7 días (48h a 168h)", () => {
    // 96 horas (4 días)
    const expDate = new Date("2026-11-08T12:00:00Z");
    const result = evaluateBatchColor(expDate, referenceDate);

    expect(result.code).toBe("YELLOW_WARNING");
    expect(result.hex).toBe("#D69E2E");
    expect(result.priority).toBe(2);
    expect(result.hoursRemaining).toBe(96);
    expect(result.iconName).toBe("RotateCw");
  });

  it("debe asignar VERDE SEGURO (#38A169) si el vencimiento es superior a 7 días (>168h)", () => {
    // 240 horas (10 días)
    const expDate = new Date("2026-11-14T12:00:00Z");
    const result = evaluateBatchColor(expDate, referenceDate);

    expect(result.code).toBe("GREEN_SAFE");
    expect(result.hex).toBe("#38A169");
    expect(result.priority).toBe(3);
    expect(result.hoursRemaining).toBe(240);
    expect(result.iconName).toBe("Box");
  });

  it("debe asignar VERDE SEGURO (#38A169) si el producto es no perecedero (sin fecha de vencimiento)", () => {
    const result = evaluateBatchColor(null, referenceDate);

    expect(result.code).toBe("GREEN_SAFE");
    expect(result.hex).toBe("#38A169");
    expect(result.priority).toBe(3);
    expect(result.hoursRemaining).toBeNull();
  });
});

