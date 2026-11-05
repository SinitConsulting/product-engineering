# Research & Technical Decisions: Control de Inventario FIFO por Códigos de Colores y Registro Rápido

**Feature**: `specs/001-fifo-color-inventory`  
**Date**: 2026-11-04  
**Status**: Completed  

---

## Decision 1: Motor de Cálculo FIFO y Evaluación Semáforo

### Contexto
El sistema requiere determinar en tiempo real qué lote debe despacharse primero y con qué color debe representarse en la interfaz visual según la proximidad de vencimiento y el orden de llegada.

### Decisión
Implementar la lógica de cola FIFO y evaluación semáforo a nivel de servicio centralizado con reglas deterministas:
1. **Prioridad 1 (Caducidad Crítica)**: Cualquier lote con fecha de vencimiento menor a 48 horas se etiqueta con **Rojo Urgente (`#E53E3E`)** y encabeza la cola de despacho de forma absoluta.
2. **Prioridad 2 (Precaución)**: Lotes con vencimiento entre 3 y 7 días se etiquetan con **Amarillo Precaución (`#D69E2E`)**.
3. **Prioridad 3 (Seguro / No Perecedero)**: Lotes con vencimiento superior a 7 días o sin vencimiento se etiquetan con **Verde Seguro (`#38A169`)**.
4. **Desempate FIFO**: Dentro de la misma categoría de color o ante fechas de caducidad idénticas, el despacho se ordena estrictamente por `created_at ASC` (marca de tiempo cronológica de ingreso).

### Rationale
- Garantiza cumplimiento de los principios de `skills_marca` y previene el desperdicio de artículos perecederos.
- El cálculo en memoria o consulta indexada `ORDER BY CASE ... END, created_at ASC` ejecuta en menos de 10ms, cumpliendo con la meta de respuesta de <1s.

### Alternativas Consideradas
- *Cálculo exclusivo por orden de llegada (sin fecha de caducidad)*: Rechazado porque en productos perecederos (alimentos, insumos médicos) un lote ingresado antes podría tener vencimiento más tardío que un lote recién ingresado que vence mañana.
- *Cálculo manual por el operador*: Rechazado por riesgo de error humano y violación del principio de simplicidad para voluntarios.

---

## Decision 2: Captura Híbrida en Interfaz Web (Lector de Códigos + Atajos de Teclado)

### Contexto
El registro rápido exige dar de alta un lote en menos de 8 segundos sin obligar al usuario a tomar el ratón, soportando tanto lectores ópticos (pistolas de códigos de barra USB/Bluetooth) como tecleo manual acelerado.

### Decisión
Implementar un `QuickEntryController` en el cliente con:
1. **Buffer de escaneo global**: Detección de caracteres entrantes con intervalo de pulsación ultra-rápido (<30ms entre teclas, típico de pistolas emuladoras de teclado) finalizado por un código `Enter`.
2. **AutoFocus continuo**: El foco permanece en el campo de entrada principal tras cada guardado, permitiendo registro continuo sin interrupciones.
3. **Atajos de teclado universales**:
   - `F2` o `Alt+N`: Nuevo registro rápido.
   - `Tab` / `Shift+Tab`: Navegación entre SKU, Cantidad y Fecha.
   - `Enter`: Confirmar y despachar/guardar.
   - `Escape`: Cancelar o limpiar formulario.

### Rationale
- Las pistolas de códigos de barras comerciales operan en modo HID (Keyboard Emulation). Un listener de teclado unificado no requiere drivers ni librerías propietarias y funciona en cualquier navegador moderno.
- Cumple con el criterio de éxito SC-001 (<8 segundos por registro).

### Alternativas Consideradas
- *Uso exclusivo de cámara web para escaneo (WebRTC/BarcodeDetector)*: Útil como fallback móvil, pero más lento para recepción masiva que un escáner físico dedicado. Se mantiene como posible mejora futura sin bloquear el flujo principal.
- *Formulario tradicional con múltiples clics*: Rechazado por exceder los tiempos máximos tolerables en bodega.

---

## Decision 3: Arquitectura de Software y Stack Tecnológico

### Contexto
De acuerdo a la Constitución del Proyecto (`.specify/memory/constitution.md`), el stack debe ser predecible, alineado con Node/TypeScript (Next.js) o Rails, con soporte para contenerización en Docker y gestión reproducible de dependencias.

### Decisión
- **Framework**: **Next.js 14+ (App Router)** con TypeScript y React 18+.
- **Estilos y UX**: **Tailwind CSS**, aplicando las variables de color corporativas (`#E53E3E`, `#D69E2E`, `#38A169`) y fuentes sans-serif de alto contraste.
- **Iconografía**: **Lucide React** (iconos universales: `Box`, `RotateCw`, `AlertTriangle`, `CheckCircle2`, `Barcode`, `Clock`).
- **Base de Datos y Persistencia**: **SQLite** (con Prisma o Drizzle ORM) empaquetado en volumen local Docker para portabilidad inmediata, con compatibilidad nativa hacia PostgreSQL si se escala.
- **Validación de Datos**: **Zod** para tipado seguro extremo a extremo en cliente y servidor.
- **Pruebas**: **Vitest** para tests unitarios y de lógica FIFO; **Playwright** / **React Testing Library** para validación de flujos de usuario.

### Rationale
- TypeScript + Next.js ofrece tipado estricto, excelente rendimiento en dispositivos móviles económicos y soporte para despliegues ligeros con `Dockerfile` multi-stage.
- Zod asegura que los campos de lote, cantidad positiva y fechas de vencimiento sean validados rigurosamente antes de tocar la base de datos.

### Alternativas Consideradas
- *Rails 7 + Hotwire*: Excelente alternativa contemplada en la constitución; se eligió TypeScript + Next.js debido a la interactividad en tiempo real del buffer de escáner y la disponibilidad de componentes visuales reactivos para el semáforo.

---

## Decision 4: Accesibilidad y Diseño Operativo (`skills_marca`)

### Contexto
Los operadores son en su mayoría voluntarios con niveles heterogéneos de destreza digital, operando en bodegas con iluminación cambiante.

### Decisión
1. **Modo Alto Contraste**: Fondos con contraste WCAG AAA para los badges de color semáforo (texto blanco `#FFFFFF` sobre fondos `#E53E3E` y `#38A169`; texto oscuro `#1A202C` sobre `#D69E2E` para máxima legibilidad).
2. **Doble Codificación (Color + Icono + Texto)**: Ningún estado depende únicamente del color. Todo lote crítico incluye el color rojo, el icono de alerta o rotación urgente, y la etiqueta en texto "URGENTE (<48h)". Esto garantiza accesibilidad total incluso para usuarios con daltonismo.
3. **Áreas táctiles generosas**: Botones con tamaño mínimo de 48x48px aptos para uso en terminales táctiles o con guantes de almacén.

