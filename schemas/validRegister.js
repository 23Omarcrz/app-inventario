import zod from 'zod';

const registerSchema = zod.object({
    // ✅ Campo: nombre
    nombre: zod.string().regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: "Solo se aceptan letras y espacios" }),  // Validación para solo letras
    apellidos: zod.string().regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: "Solo se aceptan letras y espacios" }),  // Validación para solo letras
    email: zod.string()
        .email({ message: "El correo no es válido" }),
    username: zod.string({
        required_error: "El username es obligatorio",
        invalid_type_error: "El username debe ser una cadena"
    })
        .min(5, { message: "Debe tener mínimo 5 caracteres" })
        .max(15, { message: "No debe superar 15 caracteres" })
        .regex(/^[a-zA-Z0-9._-]+$/, { message: "Solo se aceptan letras, números, puntos, guiones y guion bajo" }),
        
    password: zod.string({
        required_error: "La contraseña es obligatoria",
        invalid_type_error: "La contraseña debe ser una cadena"
    })
        .min(8, { message: "Debe incluir mínimo 8 caracteres"})
        .max(100, { message: "No debe superar 100 caracteres" })
        .regex(/[a-z]/, { message: "Se debe incluir al menos una letra minúscula" })
        .regex(/[A-Z]/, { message: "Se debe incluir al menos una letra mayúscula" })
        .regex(/[0-9]/, { message: "Se debe incluir al menos un número" })
        .regex(/[\W_]/, { message: "Se debe incluir al menos un símbolo" })
});

export function validateRegister(object) {
    return registerSchema.safeParse(object);
}

export function validatePartialRegister(object) {
    return registerSchema.partial().safeParse(object);
}