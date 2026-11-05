# Feature Specification: Control de Inventario FIFO por Códigos de Colores y Registro Rápido

**Feature Branch**: `001-fifo-color-inventory`

**Created**: 2026-11-04

**Status**: Ready for Planning

**Input**: User description: "Control de Inventario FIFO por Códigos de Colores y Registro Rápido. Lineamientos visuales basados en skills_marca (sistema semáforo, legibilidad y UX inclusiva)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro Rápido Híbrido de Entrada de Lotes (Priority: P1)

Como voluntario o encargado de recepción en almacén, quiero registrar la entrada de productos mediante lector de código de barras o atajos de teclado en una interfaz ágil de mínimos pasos, para que el sistema asigne de inmediato el lote a la cola FIFO y calcule su código de color semáforo según su fecha de caducidad.

**Why this priority**: Es la puerta de entrada indispensable del inventario. Sin una captura rápida, inclusiva y sin fricción técnica en recepción, no es posible aplicar la trazabilidad FIFO ni calcular los colores de rotación.

**Independent Test**: Puede probarse registrando un lote de 20 unidades con escáner o teclado en menos de 10 segundos y verificando que el lote queda activo con su código de color correspondiente según su fecha de vencimiento.

**Acceptance Scenarios**:

1. **Given** un producto catalogado, **When** el usuario escanea su código de barras o escribe su SKU con atajo de teclado e ingresa cantidad y fecha de vencimiento, **Then** el lote se crea inmediatamente en el inventario con su marca temporal y su color semáforo asignado.
2. **Given** la interfaz de registro rápido, **When** el usuario confirma el ingreso (mediante la tecla `Enter` o disparo del escáner), **Then** la pantalla guarda el lote y resetea el foco al campo de captura en menos de 1 segundo para el siguiente registro.

---

### User Story 2 - Despacho Asistido FIFO con Semáforo de Urgencia (Priority: P1)

Como despachador o voluntario de bodega, quiero que al solicitar la salida de un producto el sistema priorice y resalte automáticamente el lote con color Rojo Urgente o el más antiguo en cola FIFO, impidiendo despachos erróneos de lotes frescos, para garantizar la entrega de artículos antes de su vencimiento y evitar mermas.

**Why this priority**: Es el núcleo del valor logístico. Asegura que lo que está próximo a expirar o entró primero salga primero de forma inequívoca para cualquier voluntario.

**Independent Test**: Puede probarse creando dos lotes: uno con vencimiento a 24 horas (Rojo `#E53E3E`) y otro con vencimiento a 15 días (Verde `#38A169`), solicitando una salida y confirmando que el sistema descuenta obligatoriamente del lote Rojo.

**Acceptance Scenarios**:

1. **Given** un producto con lotes en distintas fechas de caducidad, **When** el usuario inicia un despacho, **Then** el sistema presenta y selecciona por defecto el lote en Rojo Urgente (o el más antiguo según FIFO).
2. **Given** un lote prioritario disponible, **When** el operador intenta forzar la salida desde un lote Amarillo o Verde más reciente, **Then** el sistema bloquea la acción y exige confirmación con justificación explícita de excepción.

---

### User Story 3 - Tablero Visual Inclusivo con Sistema Semáforo (Priority: P2)

Como coordinador de operaciones, quiero visualizar un tablero con tarjetas de alto contraste e iconografía universal (cajas, flechas de rotación) codificadas por colores (#E53E3E, #D69E2E, #38A169), para identificar al instante qué lotes requieren evacuación urgente sin depender de destrezas digitales avanzadas.

**Why this priority**: Permite que cualquier voluntario o supervisor reconozca la urgencia operativa a simple vista bajo condiciones de iluminación variable o dispositivos móviles básicos.

**Independent Test**: Puede probarse abriendo el tablero en un dispositivo móvil con pantalla estándar y filtrando por color "Rojo Urgente", comprobando legibilidad y contraste inmediato de los lotes críticos.

**Acceptance Scenarios**:

1. **Given** el inventario activo, **When** el usuario ingresa al tablero, **Then** los lotes se muestran clasificados con su color semáforo correspondiente, iconos universales y tipografía sans-serif de alto contraste.
2. **Given** el tablero de inventario, **When** el usuario toca el filtro de color Rojo, **Then** se aíslan exclusivamente los lotes con vencimiento menor a 48 horas.

---

### User Story 4 - Partición Automática de Despachos entre Lotes (Priority: P3)

Como despachador, cuando la cantidad solicitada supera el stock del lote más urgente, quiero que el sistema descuente el total disponible del lote crítico y complete el resto automáticamente con el lote subsiguiente en la secuencia FIFO, para evitar cálculos matemáticos manuales a los voluntarios.

**Why this priority**: Reduce errores de cálculo y tiempo operativo en órdenes grandes que agotan un lote.

**Independent Test**: Solicitar 12 unidades habiendo un lote prioritario con 5 unidades y otro secundario con 10; el sistema debe agotar las 5 del primero y descontar 7 del segundo.

**Acceptance Scenarios**:

1. **Given** Lote A (Rojo, 5 unidades) y Lote B (Amarillo, 10 unidades), **When** se procesa una salida de 12 unidades, **Then** Lote A queda en 0, Lote B queda en 3 y se genera el registro del movimiento desglosado.

---

### Edge Cases

- **Lotes sin fecha de caducidad (no perecederos)**: Se clasifican automáticamente como Verde Seguro (`#38A169`) y su rotación se rige exclusivamente por el orden cronológico estricto de entrada (FIFO).
- **Intento de retiro de lote no prioritario**: La interfaz despliega un modal de advertencia en alto contraste requiriendo confirmación con motivo antes de autorizar la salida no-FIFO.
- **Transición automática de estado semáforo**: Si un lote pasa de tener 3 días a menos de 48 horas de vida útil mientras permanece en almacén, su distintivo visual debe cambiar dinámicamente de Amarillo a Rojo sin requerir edición manual.
- **Lote dañado o no apto para consumo**: Se debe permitir marcar el lote como "Merma/Baja", retirándolo de la cola FIFO activa y registrando la pérdida con fines de auditoría.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE proveer un módulo de registro rápido de entradas que permita dar de alta un lote en un máximo de 3 campos esenciales (producto/SKU, cantidad, fecha de vencimiento/lote).
- **FR-002**: El módulo de registro rápido DEBE soportar modalidad híbrida: lectura continua con lector óptico de código de barras/QR (con auto-confirmación mediante `Enter`) y captura ágil por atajos de teclado y teclado numérico sin necesidad de ratón.
- **FR-003**: El sistema DEBE asignar y actualizar dinámicamente el código de color semáforo de cada lote según los lineamientos de marca (`skills_marca`):
  - 🔴 **Rojo Urgente (`#E53E3E`)**: Vencimiento menor a 48 horas (prioridad absoluta de salida).
  - 🟡 **Amarillo Precaución (`#D69E2E`)**: Vencimiento entre 3 y 7 días.
  - 🟢 **Verde Seguro (`#38A169`)**: Vencimiento superior a 7 días, productos de larga duración o no perecederos.
- **FR-004**: El sistema DEBE ordenar la sugerencia de salida aplicando regla combinada: primero los lotes en Rojo Urgente por orden de vencimiento más cercano, y en igualdad de condición o en artículos no perecederos, el orden cronológico estricto de ingreso (FIFO).
- **FR-005**: Al iniciar un despacho, el sistema DEBE preseleccionar de forma automática el lote de mayor urgencia FIFO sin requerir selección manual del voluntario.
- **FR-006**: Si un usuario intenta seleccionar un lote con menor prioridad existiendo lotes más urgentes con stock, el sistema DEBE emitir una advertencia visible y requerir confirmación explícita con registro del motivo.
- **FR-007**: El sistema DEBE permitir la partición automática de una orden de salida cuando la cantidad solicitada excede las existencias del lote prioritario, tomando el remanente del siguiente lote en la secuencia.
- **FR-008**: La interfaz visual DEBE implementar tipografía sans-serif de alto contraste con tamaños legibles a distancia en bodegas y dispositivos móviles económicos.
- **FR-009**: La interfaz DEBE incorporar iconografía universal (cajas, flechas de rotación) para garantizar una experiencia inclusiva a voluntarios con cualquier nivel de alfabetización digital.
- **FR-010**: El sistema DEBE mantener una bitácora inmutable de auditoría con todas las entradas, salidas y mermas, registrando fecha/hora, lote, cantidad y usuario.

### Key Entities *(include if feature involves data)*

- **Producto (Item)**: Artículo base en catálogo. Atributos: Código único/SKU, Código de barras, Nombre descriptivo, Categoría (Perecedero / No perecedero), Unidad de medida, Stock total.
- **Lote de Inventario (Inventory Batch)**: Lote físico específico. Atributos: Identificador de lote, Referencia a Producto, Fecha/hora de ingreso, Fecha de vencimiento, Cantidad inicial, Cantidad disponible actual, Color semáforo calculado (`#E53E3E`, `#D69E2E`, `#38A169`), Estado (Activo, Agotado, Merma).
- **Movimiento de Inventario (Inventory Transaction)**: Transacción registrada. Atributos: Identificador, Tipo (Entrada, Despacho, Ajuste/Baja), Lote afectado, Cantidad, Saldo resultante, Fecha/hora, Usuario responsable, Motivo de excepción (si aplica).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un voluntario o encargado registra un lote de entrada en la interfaz híbrida en menos de 8 segundos.
- **SC-002**: El 100% de los lotes con vencimiento menor a 48 horas se resaltan visualmente en color Rojo Urgente (`#E53E3E`).
- **SC-003**: Cero despachos accidentales de lotes no prioritarios gracias a la advertencia obligatoria del sistema.
- **SC-004**: Voluntarios sin capacitación previa logran identificar el lote correcto para despacho en el tablero visual en menos de 5 segundos.
- **SC-005**: Las vistas de registro rápido y tablero semáforo cargan y procesan transacciones en menos de 1 segundo en dispositivos móviles de gama de entrada.

## Assumptions

- **Dispositivos y Pantallas**: Las terminales y teléfonos móviles utilizados por los voluntarios cuentan con pantallas capaces de desplegar colores RGB estándar y navegadores web modernos.
- **Lectores ópticos**: Los escáneres de código de barras funcionan en modo emulación de teclado USB/Bluetooth enviando los caracteres seguidos de un caracter de terminación (`Enter`).
- **Voluntariado**: La interfaz asume alta rotación de personal voluntario, por lo que la simplicidad visual (semáforo + iconos universales) es prioritaria sobre opciones avanzadas complejas.
