import { z } from "zod";

export const categorySchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    icon: z.string().min(1, "Selecciona un icono"),
    color: z.string().min(1, "Selecciona un color"),
    type: z.enum(["expense", "income"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;