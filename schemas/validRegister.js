import zod from 'zod';

const registerSchema = zod.object({
    // ✅ Campo: nombre
    nombre: zod.string().regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: "El campo nombre solo puede tener letras y espacios" }),  // Validación para solo letras
    apellidos: zod.string().regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: "El campo apellidos solo puede tener letras y espacios" }),  // Validación para solo letras
    email: zod.string()
        .email("El correo no es válido"),
    username: zod.string({
        required_error: "El username es obligatorio",
        invalid_type_error: "El username debe ser una cadena"
    })
        .min(3, "El username debe tener mínimo 3 caracteres")
        .max(30, "El username no debe superar 30 caracteres")
        .regex(/^[a-zA-Z0-9._-]+$/, "El username solo puede contener letras, números, puntos, guiones y guion bajo"),
        
    password: zod.string({
        required_error: "La contraseña es obligatoria",
        invalid_type_error: "La contraseña debe ser una cadena"
    })
        .min(8, "La contraseña debe tener mínimo 8 caracteres")
        .max(100, "La contraseña no debe superar 100 caracteres")
        .regex(/[a-z]/, "La contraseña debe incluir al menos una letra minúscula")
        .regex(/[A-Z]/, "La contraseña debe incluir al menos una letra mayúscula")
        .regex(/[0-9]/, "La contraseña debe incluir al menos un número")
        .regex(/[\W_]/, "La contraseña debe incluir al menos un símbolo")
});


export function validateRegister(object) {
    return registerSchema.safeParse(object);
}

export function validatePartialRegister(object) {
    return registerSchema.partial().safeParse(object);
}