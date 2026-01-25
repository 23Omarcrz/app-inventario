import z from 'zod';

const categorySchema = z.object({
    id_usuario: z
        .number('id_usuario debe ser un numero valido') 
        .int(),        // ...entero

    nombre_categoria: z
        .string('el nombre de la categoría debe ser un string') 
        .trim()
        .nonempty("el nombre de la categoría es obligatoria")
        .regex(/^[a-zA-Z0-9_-]+$/, { message: "Solo se permiten letras, números, guiones y guion bajo" }),
})

export function validateCategory(object) {
    return categorySchema.safeParse(object);
}

export function validatePartialCategoy(object) {
    return categorySchema.partial().safeParse(object);
}