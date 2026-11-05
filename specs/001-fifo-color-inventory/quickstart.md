# Quickstart & Validation Guide: Control de Inventario FIFO

**Feature**: `specs/001-fifo-color-inventory`  
**Date**: 2026-11-04  
**Status**: Ready for Validation  

---

## 1. Prerrequisitos y Entorno

- **Node.js**: v20+ LTS instalado (`node -v`).
- **Gestor de Paquetes**: `npm` o `pnpm` con lockfile determinista.
- **Docker**: (Opcional pero recomendado para aislamiento según la Constitución).
- **Dispositivo / Emulador**: Navegador web moderno con pantalla a color o lector de código de barras USB/Bluetooth en modo HID.

---

## 2. Escenarios Ejecutables de Validación

Los siguientes 4 escenarios permiten validar end-to-end que el sistema cumple con todas las historias de usuario prioritarias (P1, P2 y P3) definidas en [spec.md](./spec.md).

---

### Escenario 1: Registro Rápido Híbrido con Asignación de Color Semáforo (User Story 1 - P1)

**Objetivo**: Probar la entrada ágil de mercancía con asignación inmediata de código semáforo según fecha de caducidad.

1. **Paso 1: Abrir la pantalla de Registro Rápido**:
   - Navegar a `/inventory/quick-entry`.
   - Verificar que el cursor se posiciona automáticamente en el campo "Escanear Código / SKU".
2. **Paso 2: Captura del Lote A (Crítico <48h)**:
   - Simular escaneo de código o escribir: `7751234567890`.
   - Presionar `Tab` o dejar que el lector envíe `Enter` automático.
   - Ingresar Cantidad: `20`.
   - Ingresar Fecha de Vencimiento: Fecha de mañana (e.g. 24 horas restantes).
   - Presionar `Enter`.
3. **Resultado Esperado**:
   - El sistema guarda el lote en menos de 1 segundo sin recargar la página.
   - Aparece un badge de confirmación en alto contraste con color **Rojo Urgente (`#E53E3E`)** e icono `AlertTriangle`.
   - El formulario limpia los campos y recupera el foco inmediatamente para el siguiente escaneo.

---

### Escenario 2: Despacho Asistido FIFO y Bloqueo de Violaciones (User Story 2 - P1)

**Objetivo**: Confirmar que el sistema impone la regla FIFO y bloquea el retiro accidental de mercancía más reciente.

1. **Paso 1: Preparación de Datos**:
   - Registrar un segundo lote (Lote B) del mismo producto con vencimiento a 15 días (Verde Seguro `#38A169`, 30 unidades).
2. **Paso 2: Iniciar Salida de Mercancía**:
   - Navegar a `/inventory/dispatch`.
   - Seleccionar o escanear el SKU `7751234567890` con cantidad a despachar: `10`.
3. **Paso 3: Verificación de Sugerencia Automática**:
   - El sistema preselecciona automáticamente el **Lote A** (Rojo Urgente) con 10 unidades.
4. **Paso 4: Intento de Violación FIFO**:
   - Intentar cambiar manualmente la asignación para descontar las 10 unidades del **Lote B** (Verde).
5. **Resultado Esperado**:
   - El sistema despliega un modal bloqueante en alto contraste indicando:
     > *"⚠️ Violación FIFO detectada: El Lote A tiene vencimiento crítico (<48h). Para continuar con el Lote B se requiere justificación obligatoria."*
   - No permite confirmar la salida hasta ingresar al menos 10 caracteres de motivo o volver al lote sugerido.

---

### Escenario 3: Tablero Visual Semáforo e Iconografía Inclusiva (User Story 3 - P2)

**Objetivo**: Comprobar la legibilidad operativa para voluntarios y el filtrado por semáforo.

1. **Paso 1: Abrir Tablero de Control**:
   - Navegar a `/inventory/dashboard`.
2. **Paso 2: Verificación de Accesibilidad (`skills_marca`)**:
   - Confirmar que las tarjetas usan tipografía sans-serif de gran tamaño.
   - Confirmar que los lotes Rojos muestran `#E53E3E`, los Amarillos `#D69E2E` y los Verdes `#38A169`.
   - Confirmar que se muestran iconos universales (`Box`, `RotateCw`, `AlertTriangle`).
3. **Paso 3: Filtrado por Color**:
   - Pulsar el botón filtro "🔴 URGENTE".
4. **Resultado Esperado**:
   - La vista filtra instantáneamente (<100ms) mostrando solo el Lote A.

---

### Escenario 4: Partición Automática de Despachos Multilote (User Story 4 - P3)

**Objetivo**: Validar el reparto automático de cantidades cuando un pedido supera el stock del lote prioritario.

1. **Paso 1: Configuración**:
   - Lote A dispone de 10 unidades remanentes (Rojo).
   - Lote B dispone de 30 unidades (Verde).
2. **Paso 2: Solicitud de Despacho Mayor**:
   - Solicitar despacho de `25` unidades del producto.
3. **Resultado Esperado**:
   - El plan de despacho asigna automáticamente:
     - 10 unidades del Lote A (agotándolo a 0).
     - 15 unidades del Lote B (restando saldo a 15).
   - Se crea una transacción atómica con el desglose exacto por lote.

