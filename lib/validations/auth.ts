import * as z from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es requerida"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const profileSchema = z.object({
    fullName: z.string().min(3, "Mínimo 3 caracteres"),
    currency: z.string().min(1, "Selecciona una moneda"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;