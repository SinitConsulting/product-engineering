# Implementation Plan: Control de Inventario FIFO por Códigos de Colores y Registro Rápido

**Branch**: `001-fifo-color-inventory` | **Date**: 2026-11-04 | **Spec**: [specs/001-fifo-color-inventory/spec.md](./spec.md)

**Input**: Feature specification from `specs/001-fifo-color-inventory/spec.md`

---

## Summary

Implementar un sistema web de control de inventarios diseñado para almacenes asistidos por voluntarios que garantiza la rotación estricta **FIFO (First-In, First-Out)** y previene el desperdicio de productos perecederos.  
El enfoque técnico se basa en una arquitectura **Next.js 14+ (App Router)** con TypeScript, combinando captura rápida híbrida (lectores ópticos de código de barras/QR + atajos de teclado sin ratón), cálculo dinámico del sistema semáforo según las reglas de `skills_marca` (🔴 `#E53E3E`, 🟡 `#D69E2E`, 🟢 `#38A169`), y partición automática de pedidos entre lotes consecutivos.

---

## Technical Context

- **Language/Version**: TypeScript 5.3+ / Node.js 20 LTS
- **Primary Dependencies**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React (iconografía universal), Zod (validación de esquemas)
- **Storage**: SQLite local estructurado con Prisma ORM (portable y contenerizable en Docker), con soporte transparente para PostgreSQL
- **Testing**: Vitest para tests unitarios del motor FIFO y lógica semáforo; React Testing Library para componentes y captura de teclado
- **Target Platform**: Web Responsive / PWA optimizada para navegadores de escritorio y dispositivos móviles económicos de almacén
- **Project Type**: Web Application Fullstack (Next.js con Server Actions / API Routes)
- **Performance Goals**: Registro rápido de entrada en <8 segundos; tiempo de respuesta de cálculo FIFO y renderizado semáforo en <1 segundo
- **Constraints**: 
  - Cumplimiento estricto de la paleta semáforo de `skills_marca`: Rojo (`#E53E3E`), Amarillo (`#D69E2E`), Verde (`#38A169`)
  - Doble codificación accesible (color + icono universal + texto en alto contraste)
  - Modo escáner continuo sin recarga de página ni pérdida de foco
- **Scale/Scope**: Operación en almacén local con hasta 5.000 artículos activos y 50.000 transacciones históricas

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio Constitucional | Estado | Evaluación y Cumplimiento |
| :--- | :---: | :--- |
| **I. Spec-Driven Intent** | **PASÓ** | Toda la arquitectura y contratos derivan estrictamente de los requerimientos de `spec.md`. No se añade lógica arbitraria no especificada. |
| **II. Context Optimization** | **PASÓ** | Documentación técnica modular (`data-model.md`, `contracts/`, `quickstart.md`, `research.md`) sin sobrecarga innecesaria de contexto. |
| **III. Verifiable Acceptance Criteria** | **PASÓ** | Cada historia P1-P3 cuenta con escenarios de prueba independientes y reproducibles documentados en `quickstart.md`. |
| **IV. Modular & Self-Contained Scope** | **PASÓ** | El alcance está delimitado exclusivamente al módulo de inventario FIFO de un almacén local. |
| **V. Reproducibility & Isolation** | **PASÓ** | Stack contenerizable con `Dockerfile` multi-stage y dependencias fijadas mediante lockfile determinista. |

**Resultado Global**: **APROBADO SIN VIOLACIONES**.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-fifo-color-inventory/
├── spec.md              # Requerimientos de producto y criterios de aceptación
├── plan.md              # Plan de implementación y arquitectura técnica
├── research.md          # Decisiones de investigación y alternativas (Fase 0)
├── data-model.md        # Modelo de datos, relaciones y ciclo de vida (Fase 1)
├── quickstart.md        # Guía paso a paso de validación ejecutable (Fase 1)
├── contracts/           # Especificación de contratos y endpoints API (Fase 1)
│   └── inventory-api.md
├── checklists/          # Checklists de calidad de requerimientos
│   └── requirements.md
└── tasks.md             # Desglose de tareas técnicas (Generado en /speckit-tasks)
```

### Source Code Layout

```text
src/
├── app/
│   ├── layout.tsx                      # Layout global con estilos y fuentes sans-serif
│   ├── page.tsx                        # Redirección al tablero de inventario
│   ├── inventory/
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Tablero visual con semáforo y filtros por color
│   │   ├── quick-entry/
│   │   │   └── page.tsx                # Pantalla de registro rápido continuo con escáner
│   │   └── dispatch/
│   │       └── page.tsx                # Pantalla de despacho asistido con bloqueo FIFO
│   └── api/
│       └── inventory/
│           ├── quick-entry/route.ts    # POST: alta acelerada de lotes
│           ├── suggest-dispatch/route.ts# GET: cálculo de lotes prioritarios FIFO
│           ├── dispatch/route.ts       # POST: confirmación y partición de despacho
│           └── dashboard/route.ts      # GET: datos de tablero resumidos por color
│
├── components/
│   ├── ui/
│   │   ├── badge.tsx                   # Badges semáforo (#E53E3E, #D69E2E, #38A169)
│   │   ├── button.tsx                  # Botones táctiles de gran tamaño (48x48px mín.)
│   │   └── modal.tsx                   # Modales de advertencia y confirmación de excepción
│   ├── inventory/
│   │   ├── scanner-input.tsx           # Listener global para escáner y teclado
│   │   ├── batch-card.tsx              # Tarjeta de lote con icono universal y color
│   │   └── dispatch-modal.tsx          # Confirmación y desglose multilote
│
├── lib/
│   ├── db/
│   │   ├── client.ts                   # Cliente de base de datos (Prisma / SQLite)
│   │   └── schema.prisma               # Esquema de datos con Products, Batches y Transactions
│   ├── fifo/
│   │   ├── calculator.ts               # Lógica pura de cálculo de cola y prioridad FIFO
│   │   └── color-rules.ts              # Reglas semáforo de skills_marca (<48h, 3-7d, >7d)
│   └── validators/
│       └── inventory-schemas.ts        # Esquemas Zod para entradas y salidas
│
└── tests/
    ├── unit/
    │   ├── fifo-calculator.test.ts     # Pruebas unitarias de ordenamiento y desempate
    │   └── color-rules.test.ts         # Pruebas unitarias de transición de color semáforo
    └── integration/
        ├── quick-entry.test.ts         # Pruebas del flujo de entrada rápida
        └── dispatch-allocation.test.ts # Pruebas de partición automática de pedidos
```

**Structure Decision**: Se adopta la estructura monolítica modular Next.js (App Router) en `src/`, centralizando la lógica FIFO pura en `lib/fifo/` para permitir que sea testeable al 100% de forma desacoplada de la interfaz de usuario.

---

## Complexity Tracking

> **Estado**: Todas las puertas de la Constitución fueron satisfechas. No existen violaciones de complejidad que justificar.
