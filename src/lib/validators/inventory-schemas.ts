import { z } from "zod";

export const QuickEntrySchema = z.object({
  sku: z.string().min(3, "El SKU o código de barra debe tener al menos 3 caracteres").max(64),
  product_name: z.string().optional(),
  batch_number: z.string().min(1, "El número de lote es obligatorio").max(50),
  quantity: z.number().int().positive("La cantidad debe ser un entero mayor a cero"),
  expiration_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido. Utilice YYYY-MM-DD")
    .nullable()
    .optional(),
  operator_name: z.string().min(2, "El nombre del operador es obligatorio").max(60),
});

export type QuickEntryInput = z.infer<typeof QuickEntrySchema>;

export const SuggestDispatchSchema = z.object({
  sku: z.string().min(1, "El SKU es obligatorio"),
  quantity: z.number().int().positive("La cantidad requerida debe ser mayor a cero"),
});

export type SuggestDispatchInput = z.infer<typeof SuggestDispatchSchema>;

export const DispatchAllocationItemSchema = z.object({
  batch_id: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const DispatchSchema = z.object({
  sku: z.string().min(1, "El SKU es obligatorio"),
  quantity: z.number().int().positive("La cantidad total a despachar debe ser mayor a cero"),
  operator_name: z.string().min(2, "El nombre del operador es obligatorio"),
  force_override: z.boolean().default(false),
  override_reason: z.string().nullable().optional(),
  allocations: z.array(DispatchAllocationItemSchema).min(1, "Debe incluir al menos una asignación de lote"),
}).refine(
  (data) => {
    if (data.force_override && (!data.override_reason || data.override_reason.trim().length < 10)) {
      return false;
    }
    return true;
  },
  {
    message: "Debe justificar la violación FIFO con al menos 10 caracteres al forzar el despacho.",
    path: ["override_reason"],
  }
);

export type DispatchInput = z.infer<typeof DispatchSchema>;

