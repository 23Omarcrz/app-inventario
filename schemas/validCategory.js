import zod from 'zod';

const categorySchema = zod.object({
    id_usuario: zod.number({
        invalid_type_error: 'id_usuario debe ser un numero',      // Si no es string, lanza este mensaje
        required_error: 'id_usuario es obligatorio'
    })     // Debe ser un número...
        .int(),        // ...entero
    nombre_categoria: zod.string({
        invalid_type_error: 'el nombre de la categoria debe ser un string',
        required_error: "el nombre de la categoria es obligatoria"
    }).regex(/^[a-zA-Z0-9_-]+$/, { message: "Solo se permiten letras, números, guiones y guion bajo" }),
})

export function validateCategory(object) {
    return categorySchema.safeParse(object);
}

export function validatePartialCategoy(object) {
    return categorySchema.partial().safeParse(object);
}