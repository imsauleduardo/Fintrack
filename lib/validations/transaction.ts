import { z } from "zod";

export const transactionSchema = z.object({
    amount: z.string().min(1, "El monto es obligatorio").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Monto inválido"),
    description: z.string().optional(),
    category_id: z.string().min(1, "Selecciona una categoría"),
    date: z.string().min(1, "La fecha es obligatoria"),
    type: z.enum(["expense", "income"]),
    payment_method: z.string().min(1, "Selecciona un método de pago"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;