import zod from 'zod';

const loginSchema = zod.object({
    username: zod.string({
        required_error: "El username es obligatorio",
    }), 
    password: zod.string({
        required_error: "La contraseña es obligatoria"
    })
})

export function validateLogin(object) {
    return loginSchema.safeParse(object);
}

export function validatePartialLogin(object) {
    return loginSchema.partial().safeParse(object);
}