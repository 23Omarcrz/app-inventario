import z from 'zod';

const addUserSchema = z.object({
    nombre: z
        .string("El valor debe ser un texto")
        .trim()
        .nonempty("El nombre es obligatorio")
        .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo se aceptan letras y espacios"),  // Validación para solo letras
    
    apellidos: z
        .string("El valor debe ser un texto")
        .trim()
        .nonempty("Los Apellidos son obligatorios")
        .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo se aceptan letras y espacios"),  // Validación para solo letras
    
    cargo: z
        .string("El valor debe ser un texto")
        .trim(),

    area: z
        .string("El valor debe ser un texto")
        .trim(),
});

export function validateAddUser(object) {
    return addUserSchema.safeParse(object);
}

export function validatePartialAddUser(object) {
    return addUserSchema.partial().safeParse(object);
}