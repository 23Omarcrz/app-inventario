import z from 'zod';

const registerSchema = z.object({
    password: z
        .string("El valor debe ser un texto")
        .nonempty("La contraseña es obligatoria")
        .min(8, { message: "Debe incluir mínimo 8 caracteres"})
        .max(100, { message: "No debe superar 100 caracteres" })
        .regex(/[a-z]/, { message: "Se debe incluir al menos una letra minúscula" })
        .regex(/[A-Z]/, { message: "Se debe incluir al menos una letra mayúscula" })
        .regex(/[0-9]/, { message: "Se debe incluir al menos un número" })
        .regex(/[\W_]/, { message: "Se debe incluir al menos un símbolo" })
});

export function validateResetPassword(object) {
    return registerSchema.safeParse(object);
}
/*
    username: z.preprocess(
        val => val ?? "",  // undefined → string vacío
        z.string({
            required_error: "El username es obligatorio",
            invalid_type_error: "Tipo de dato invalido se esperaba un string"
        }).nonempty("El username es obligatorio")
            .min(5, { message: "Debe tener mínimo 5 caracteres" })
            .max(15, { message: "No debe superar 15 caracteres" })
            .regex(/^[a-zA-Z0-9._-]+$/, { message: "Solo se aceptan letras, números, puntos, guiones y guion bajo" })
    ),




  id_categoria: z.preprocess(
  val => (val === undefined ? NaN : val), // undefined → NaN para que falle la validación
  z.number({
    required_error: "La categoria es obligatoria",
    invalid_type_error: "Tipo de dato invalido se esperaba un numero"
  })
)
*/