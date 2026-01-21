import z from 'zod';

const loginSchema = z.object({
    username: z.string({
        invalid_type_error: "El valor debe ser un texto",
    })
        .nonempty("El username es obligatorio"),

    password: z.string({
        invalid_type_error: "El valor debe ser un texto",
    })
        .nonempty("La contraseña es obligatoria")
})

export function validateLogin(object) {
    return loginSchema.safeParse(object);
}

export function validatePartialLogin(object) {
    return loginSchema.partial().safeParse(object);
}