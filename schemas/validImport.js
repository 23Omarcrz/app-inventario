import z from 'zod';

const articuloSchema = z.object({
    no_inventario: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .nonempty("El No. de inventario es obligatorio"),  //esto valida que no venga vacia la cadena o arreglo | "", [] no pasan

    no_serie: z
        .string("Tipo de dato invalido se esperaba un texto")
        .optional(),//acepta undefined sin lanzar error es decir el campo puede no existir
    // aqui no tiene caso definir required_error: "", pues si .optional() permite undefined, ese mensaje nunca se mostrar

    marca: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .optional(),

    descripcion: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .nonempty("La descripción es obligatoria"),

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
        .nonempty("La ubicación es obligatoria"),
    
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
        .string( "El valor debe ser un texto")
        .trim()
        .optional(),

    id_categoria: z
        .preprocess(
            val => Number(val),
            z
                .number("Tipo de dato invalido se esperaba un numero")
                .int()
        ),

    estatus: z
        .string("El valor debe ser un texto")
        .trim()
        .optional()
});

export function validateArticulosArray(array) {
    const validRows = [];
    const errors = [];

    array.forEach((row, index) => {
        const result = articuloSchema.safeParse(row);
        if (result.success) {
            validRows.push(result.data); // fila válida
        } else {
            errors.push({
                row: index + 1, // número de fila
                errors: result.error.issues.map(e => ({
                    field: e.path[0],
                    message: e.message
                }))
            });
        }
    });

    return { data: validRows, errors };
}
