# Tasks: Control de Inventario FIFO por Códigos de Colores y Registro Rápido

**Input**: Design documents from `specs/001-fifo-color-inventory/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/inventory-api.md](./contracts/inventory-api.md), [quickstart.md](./quickstart.md)  
**Tests**: Se incluyen pruebas unitarias y de integración conforme al Principio III de la Constitución (Test-First & Verifiable Acceptance Criteria).  
**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y entrega incremental independiente.

---

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Ejecutable en paralelo (archivos independientes, sin dependencias bloqueantes)
- **[Story]**: Mapeo a historia de usuario (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Rutas de archivo exactas en cada tarea

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto, dependencias y configuración compartida

- [x] T001 Crear estructura base de directorios del proyecto en `src/app`, `src/components`, `src/lib` y `src/tests`
- [x] T002 Inicializar proyecto Next.js 14 con TypeScript, Tailwind CSS, Lucide React y Zod en `package.json`
- [x] T003 [P] Configurar paleta semáforo de `skills_marca` (`#E53E3E`, `#D69E2E`, `#38A169`) y tipografía sans-serif en `tailwind.config.ts`
- [x] T004 [P] Configurar entorno de pruebas con Vitest y Testing Library en `vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura central que DEBE completarse antes de iniciar las historias de usuario

- [x] T005 Definir esquema de base de datos (`Product`, `InventoryBatch`, `InventoryTransaction`) en `src/lib/db/schema.prisma`
- [x] T006 Configurar cliente singleton de SQLite/Prisma en `src/lib/db/client.ts`
- [x] T007 [P] Implementar reglas de cálculo de expiración y color semáforo (<48h, 3-7d, >7d) en `src/lib/fifo/color-rules.ts`
- [x] T008 [P] Implementar componentes UI de Badge y Semáforo en alto contraste en `src/components/ui/badge.tsx`
- [x] T009 [P] Implementar componente Button accesible con área táctil mínima de 48x48px en `src/components/ui/button.tsx`
- [x] T010 Definir esquemas Zod de validación de entrada/salida de inventario en `src/lib/validators/inventory-schemas.ts`

**Checkpoint**: Base de datos y utilidades transversales listas. La implementación de historias de usuario puede comenzar.

---

## Phase 3: User Story 1 - Registro Rápido Híbrido de Entrada de Lotes (Priority: P1) 🎯 MVP

**Goal**: Permitir el alta acelerada de lotes en <8 segundos mediante escáner óptico o atajos de teclado numérico, asignando el color semáforo de caducidad.  
**Independent Test**: Registrar un lote mediante llamada API o pantalla de captura y comprobar en base de datos que el lote queda activo con stock positivo y color correspondiente.

### Tests for User Story 1
- [x] T011 [P] [US1] Pruebas unitarias para cálculo de color semáforo según horas de vida útil en `src/tests/unit/color-rules.test.ts`
- [x] T012 [P] [US1] Pruebas de integración para endpoint de registro rápido en `src/tests/integration/quick-entry.test.ts`

### Implementation for User Story 1
- [x] T013 [P] [US1] Implementar servicio de creación de lotes y alta de producto en `src/lib/services/batch-service.ts`
- [x] T014 [US1] Implementar endpoint API `POST /api/inventory/quick-entry` en `src/app/api/inventory/quick-entry/route.ts`
- [x] T015 [P] [US1] Implementar hook y componente detector de escáner HID y atajos de teclado en `src/components/inventory/scanner-input.tsx`
- [x] T016 [US1] Implementar página de Registro Rápido con autofoco continuo en `src/app/inventory/quick-entry/page.tsx`

**Checkpoint**: User Story 1 completamente funcional de forma independiente (MVP de entrada rápida alcanzado).

---

## Phase 4: User Story 2 - Despacho Asistido FIFO con Semáforo de Urgencia (Priority: P1)

**Goal**: Garantizar la rotación estricta FIFO sugiriendo y preseleccionando el lote más antiguo/crítico y bloqueando salidas no autorizadas de lotes frescos.  
**Independent Test**: Solicitar despacho habiendo dos lotes con fechas distintas y verificar que el sistema selecciona el prioritario y rechaza salidas de lotes posteriores sin motivo.

### Tests for User Story 2
- [x] T017 [P] [US2] Pruebas unitarias del motor de ordenamiento FIFO y detección de violaciones en `src/tests/unit/fifo-calculator.test.ts`
- [x] T018 [P] [US2] Pruebas de integración para cálculo de despacho y confirmación en `src/tests/integration/dispatch.test.ts`

### Implementation for User Story 2
- [x] T019 [US2] Implementar motor de cálculo de sugerencia FIFO en `src/lib/fifo/calculator.ts`
- [x] T020 [US2] Implementar endpoint API `GET /api/inventory/suggest-dispatch` en `src/app/api/inventory/suggest-dispatch/route.ts`
- [x] T021 [US2] Implementar endpoint API `POST /api/inventory/dispatch` con validación de excepción FIFO en `src/app/api/inventory/dispatch/route.ts`
- [x] T022 [P] [US2] Implementar modal de advertencia y confirmación de violación FIFO en `src/components/inventory/dispatch-modal.tsx`
- [x] T023 [US2] Implementar vista de Despacho Asistido con preselección automática en `src/app/inventory/dispatch/page.tsx`

**Checkpoint**: User Stories 1 y 2 integradas; ciclo completo de entrada y salida FIFO garantizado.

---

## Phase 5: User Story 3 - Tablero Visual Inclusivo con Sistema Semáforo (Priority: P2)

**Goal**: Visualizar el inventario activo en tarjetas de alto contraste con iconografía universal (cajas, rotación) y filtros de color instantáneos para voluntarios.  
**Independent Test**: Acceder al tablero, filtrar por color "Rojo Urgente" y validar que muestra únicamente lotes con <48 horas de vida útil.

### Tests for User Story 3
- [x] T024 [P] [US3] Pruebas de integración para agregación del tablero y filtros en `src/tests/integration/dashboard.test.ts`

### Implementation for User Story 3
- [x] T025 [US3] Implementar servicio de consulta agregada del inventario por semáforo en `src/lib/services/dashboard-service.ts`
- [x] T026 [US3] Implementar endpoint API `GET /api/inventory/dashboard` en `src/app/api/inventory/dashboard/route.ts`
- [x] T027 [P] [US3] Implementar componente de tarjeta de lote con doble codificación (color + icono + texto) en `src/components/inventory/batch-card.tsx`
- [x] T028 [US3] Implementar página del Tablero de Inventario con pills de filtro semáforo en `src/app/inventory/dashboard/page.tsx`

**Checkpoint**: Supervisión visual completa y accesible para voluntarios y coordinadores de bodega.

---

## Phase 6: User Story 4 - Partición Automática de Despachos Multilote (Priority: P3)

**Goal**: Dividir automáticamente pedidos cuya cantidad exceda el stock del lote prioritario entre los lotes subsiguientes en la cola FIFO.  
**Independent Test**: Despachar 15 unidades con Lote A de 10 unidades y Lote B de 20 unidades; comprobar que Lote A queda en 0 y Lote B en 15.

### Tests for User Story 4
- [x] T029 [P] [US4] Pruebas unitarias de partición y asignación atómica multilote en `src/tests/unit/partition-allocation.test.ts`
- [x] T030 [US4] Implementar lógica de partición atómica y débito secuencial en `src/lib/services/dispatch-service.ts`
- [x] T031 [US4] Actualizar vista y modal de despacho para desplegar desglose multilote en `src/components/inventory/dispatch-modal.tsx`

**Checkpoint**: Salidas de alto volumen automatizadas sin fricción de cálculo manual.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras de usabilidad, layouts transversales, datos de prueba y validación final

- [x] T032 [P] Crear layout principal con navegación superior accesible y tipografía sans-serif en `src/app/layout.tsx`
- [x] T033 Configurar redirección de raíz `/` hacia `/inventory/dashboard` en `src/app/page.tsx`
- [x] T034 [P] Crear script de sembrado de datos de prueba con artículos perecederos y no perecederos en `src/lib/db/seed.ts`
- [x] T035 Ejecutar los 4 escenarios de validación ejecutable de `specs/001-fifo-color-inventory/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Sin dependencias — inicio inmediato.
- **Phase 2 (Foundational)**: Depende de Phase 1 — BLOQUEA todas las historias de usuario.
- **Phase 3 (US1 - MVP)**: Depende de Phase 2 — Habilita la captura de inventario.
- **Phase 4 (US2)**: Depende de Phase 2 y Phase 3 (requiere datos de lotes generados en US1).
- **Phase 5 (US3)**: Depende de Phase 2 (puede desarrollarse en paralelo con US2).
- **Phase 6 (US4)**: Depende de Phase 4 (amplía el despacho asistido).
- **Phase 7 (Polish)**: Depende de la finalización de las historias de usuario.

### Parallel Opportunities
- Tareas marcadas con `[P]` operan sobre archivos independientes y pueden ser ejecutadas en paralelo:
  - T003 y T004 en Setup.
  - T007, T008 y T009 en Foundational.
  - T011, T012, T013 y T015 en US1.
  - T017, T018 y T022 en US2.
  - T024 y T027 en US3.
  - T029 en US4.
  - T032 y T034 en Polish.

---

## Implementation Strategy: MVP First

1. **Paso 1**: Completar Setup (T001 - T004) y Foundational (T005 - T010).
2. **Paso 2**: Implementar User Story 1 (T011 - T016) → **MVP funcional desplegable**.
3. **Paso 3**: Implementar User Story 2 (T017 - T023) → Control de salidas FIFO con bloqueo de errores.
4. **Paso 4**: Implementar User Story 3 (T024 - T028) → Tablero visual semáforo inclusivo.
5. **Paso 5**: Implementar User Story 4 (T029 - T031) → Partición multilote.
6. **Paso 6**: Polish y validación con `quickstart.md` (T032 - T035).
