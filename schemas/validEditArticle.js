import z from 'zod';

const articleSchema = z.object({
    no_inventario: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .optional(),  //esto valida que no venga vacía la cadena o arreglo | "", [] no pasan

    no_serie: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .optional(),//acepta undefined sin lanzar error es decir el campo puede no existir

    marca: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .optional(),

    descripcion: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .optional(),

    fabricante: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .optional(),

    observaciones: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .optional(),
    
    valor: z
        .preprocess(
            val => (val === "" || val == null ? undefined : Number(val)),
            z
                .number("Tipo de dato invalido se esperaba un numero")
                .nonnegative("El valor no puede ser negativo")
                .max(999_999_999, "El valor excede el límite de Dígitos")
                .multipleOf(0.01, "El valor puede tener máximo 2 decimales")
                .optional()//.nullable(),//permite null
        ),

    fecha_adquisicion: z
        .preprocess(
            val => (val === "" || val == null ? undefined : val),
            z
                .string("El valor debe ser un texto")
                .trim()
                .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
                .refine(val => !isNaN(new Date(val).getTime()), "Fecha inválida")
                .refine(val => new Date(val) <= new Date(), "No se permite fecha futura")
                .optional()
        ),

    fecha_asignacion: z
        .preprocess(
            val => (val === "" || val == null ? undefined : val),
            z
                .string("El valor debe ser un texto")
                .trim()
                .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
                .refine(val => !isNaN(new Date(val).getTime()), "Fecha inválida")
                .refine(val => new Date(val) <= new Date(), "No se permite fecha futura")
                .optional()
        ),

    ubicacion: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .optional(),
    
    resguardatario: z
        .string("El valor debe ser un texto")
        .trim()
        .optional(),

    no_interno_DCC: z
        .string("El valor debe ser un texto")
        .trim()
        .optional(),

    fecha_ultima_revision: z
        .preprocess(
            val => (val === "" || val == null ? undefined : val),
            z
                .string("El valor debe ser un texto")
                .trim()
                .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
                .refine(val => !isNaN(new Date(val).getTime()), "Fecha inválida" )
                .refine(val => new Date(val) <= new Date(), "No se permite fecha futura" )
                .optional()
        ),
    
    no_oficio_traspaso: z
        .string("El valor debe ser un texto")
        .trim()
        .optional(),

    estatus: z
        .string("El valor debe ser un texto")
        .trim()
        .optional()
});

export function validateEditArticle(object) {
    return articleSchema.safeParse(object);
}
