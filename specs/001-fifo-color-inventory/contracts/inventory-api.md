# API & Interface Contracts: Control de Inventario FIFO

**Feature**: `specs/001-fifo-color-inventory`  
**Date**: 2026-11-04  
**Status**: Ready  

---

## 1. Endpoints de la API REST / Server Actions

Todas las respuestas exitosas retornan código HTTP 200 o 201 en formato JSON. Los errores siguen la estructura estándar de error con código HTTP 4xx o 5xx.

---

### 1.1 Registro Rápido de Entrada de Lote
Permite dar de alta un nuevo lote en almacén en un único paso acelerado.

- **Método**: `POST`
- **Ruta**: `/api/inventory/quick-entry`
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "sku": "7751234567890",
  "batch_number": "LOTE-2026-A1",
  "quantity": 50,
  "expiration_date": "2026-11-06",
  "operator_name": "Voluntario Juan"
}
```

#### Reglas de Validación (Zod Schema)
- `sku`: String (3-64 caracteres), requerido. Si el producto no existe, se crea automáticamente como no catalogado pendiente de categorización.
- `batch_number`: String (1-50 caracteres), requerido.
- `quantity`: Entero estrictamente positivo (`> 0`).
- `expiration_date`: Formato ISO `YYYY-MM-DD`. Opcional solo si el producto es no perecedero.
- `operator_name`: String (2-60 caracteres), requerido.

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "batch_id": "b78a9c2e-4f5a-4b12-9c32-123456789abc",
    "product": {
      "sku": "7751234567890",
      "name": "Leche Entera 1L",
      "total_stock": 120
    },
    "batch": {
      "batch_number": "LOTE-2026-A1",
      "available_quantity": 50,
      "expiration_date": "2026-11-06",
      "color_code": "RED_URGENT",
      "color_hex": "#E53E3E",
      "hours_to_expire": 38.5,
      "urgency_label": "Urgente (<48h)"
    },
    "message": "Lote registrado y asignado a cola FIFO exitosamente."
  }
}
```

---

### 1.2 Sugerencia de Despacho FIFO
Calcula y devuelve la lista de lotes prioritarios requeridos para surtir una orden de salida sin alterar stock todavía.

- **Método**: `GET`
- **Ruta**: `/api/inventory/suggest-dispatch`
- **Query Params**:
  - `sku`: Código del producto a despachar (e.g. `7751234567890`).
  - `requested_quantity`: Cantidad requerida (entero positivo).

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "sku": "7751234567890",
    "product_name": "Leche Entera 1L",
    "requested_quantity": 25,
    "available_total": 120,
    "is_sufficient": true,
    "allocation_plan": [
      {
        "batch_id": "b78a9c2e-4f5a-4b12-9c32-123456789abc",
        "batch_number": "LOTE-2026-A1",
        "color_code": "RED_URGENT",
        "color_hex": "#E53E3E",
        "expiration_date": "2026-11-06",
        "available_in_batch": 10,
        "deduct_quantity": 10,
        "balance_after": 0,
        "is_priority_fifo": true
      },
      {
        "batch_id": "c12d3e4f-5a6b-7c8d-9e0f-987654321def",
        "batch_number": "LOTE-2026-B2",
        "color_code": "YELLOW_WARNING",
        "color_hex": "#D69E2E",
        "expiration_date": "2026-11-10",
        "available_in_batch": 40,
        "deduct_quantity": 15,
        "balance_after": 25,
        "is_priority_fifo": false
      }
    ]
  }
}
```

---

### 1.3 Ejecución de Despacho
Ejecuta la salida física del inventario debitando los lotes correspondientes y registrando los movimientos.

- **Método**: `POST`
- **Ruta**: `/api/inventory/dispatch`
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "sku": "7751234567890",
  "quantity": 25,
  "operator_name": "Voluntaria Maria",
  "force_override": false,
  "override_reason": null,
  "allocations": [
    {
      "batch_id": "b78a9c2e-4f5a-4b12-9c32-123456789abc",
      "quantity": 10
    },
    {
      "batch_id": "c12d3e4f-5a6b-7c8d-9e0f-987654321def",
      "quantity": 15
    }
  ]
}
```

#### Reglas de Validación de Violación FIFO
- Si `force_override` es `true`: el campo `override_reason` DEBE tener al menos 10 caracteres justificando el despacho fuera de orden.
- Si un usuario envía un despacho que omite un lote con mayor urgencia sin `force_override = true`, la API retorna HTTP `409 Conflict`:
  ```json
  {
    "success": false,
    "error_code": "FIFO_VIOLATION_DETECTED",
    "message": "Existen lotes prioritarios (Rojo Urgente) con existencia. Se requiere confirmación y motivo para omitir FIFO.",
    "priority_batch_suggested": "LOTE-2026-A1"
  }
  ```

---

### 1.4 Tablero Semáforo de Inventario
Suministra los datos visuales organizados por color para el panel principal y terminales móviles.

- **Método**: `GET`
- **Ruta**: `/api/inventory/dashboard`
- **Query Params**:
  - `color_filter`: `ALL`, `RED_URGENT`, `YELLOW_WARNING`, `GREEN_SAFE` (Opcional).
  - `search`: Texto de búsqueda por SKU o Nombre (Opcional).

#### Response (200 OK)
```json
{
  "success": true,
  "summary": {
    "total_batches_active": 45,
    "red_urgent_count": 8,
    "yellow_warning_count": 14,
    "green_safe_count": 23
  },
  "batches": [
    {
      "id": "b78a9c2e-4f5a-4b12-9c32-123456789abc",
      "sku": "7751234567890",
      "product_name": "Leche Entera 1L",
      "batch_number": "LOTE-2026-A1",
      "available_quantity": 10,
      "unit": "PZA",
      "expiration_date": "2026-11-06",
      "hours_remaining": 38.5,
      "color_code": "RED_URGENT",
      "color_hex": "#E53E3E",
      "urgency_badge": "🔴 URGENTE (<48h)",
      "icon": "AlertTriangle"
    }
  ]
}
```

