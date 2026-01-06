import zod from 'zod';

const articuloSchema = zod.object({
    no_inventario: zod.string({ //esto valida que el campo exista, aunque la cadena venga vacia |  "" pasa
            required_error: "El No. de inventario es obligatorio",   
            invalid_type_error: "Tipo de dato invalido se esperaba un string"
        })
            .nonempty("El No. de inventario es obligatorio"),  //esto valida que no venga vacia la cadena o arreglo | "", [] no pasan
    
        no_serie: zod.string({
            invalid_type_error: "Tipo de dato invalido se esperaba un string"
        }).optional(),//acepta undefined sin lanzar error es decir el campo puede no existir
        // aqui no tiene caso definir required_error: "", pues si .optional() permite undefined, ese mensaje nunca se mostrar
    
        marca: zod.string({
            invalid_type_error: "Tipo de dato invalido se esperaba un string"
        }).optional(),
    
        descripcion: zod.string({
            required_error: "La descripcion es obligatoria",
            invalid_type_error: "Tipo de dato invalido se esperaba un string"
        }).nonempty("La descripcion es obligatoria"),
    
        fabricante: zod.string({
            invalid_type_error: "Tipo de dato invalido se esperaba un string"
        }).optional(),
    
        observaciones: zod.string({
            invalid_type_error: "Tipo de dato invalido se esperaba un string"
        }).optional(),
        
        valor: zod.number({
            invalid_type_error: "Tipo de dato invalido se esperaba un numero"
        })
            .nonnegative()
            .refine(val => val < 1000000000, { // 10 dígitos totales incluyendo decimales
                message: "El valor excede el límite de Digitos"
            })
            .refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
                message: "El valor puede tener máximo 2 decimales"
            }).optional().nullable(),//permite null
    
        fecha_adquisicion: zod.string({
            invalid_type_error: "El valor debe ser un string"
        })
            .trim()
            .regex(/^\d{4}-\d{2}-\d{2}$/, {
                message: "Formato de fecha inválido (YYYY-MM-DD)"
            })
            .refine(
                val => !isNaN(new Date(val).getTime()),
                { message: "Fecha inválida" }
            ).refine(val => new Date(val) <= new Date(), { message: "No se permite fecha futura" })
            .optional(),
    
        fecha_asignacion: zod.string({
            invalid_type_error: "El valor debe ser un string"
        })
            .trim()
            .regex(/^\d{4}-\d{2}-\d{2}$/, {
                message: "Formato de fecha inválido (YYYY-MM-DD)"
            })
            .refine(
                val => !isNaN(new Date(val).getTime()),
                { message: "Fecha inválida" }
            ).refine(val => new Date(val) <= new Date(), { message: "No se permite fecha futura" })
            .optional(),
    
        ubicacion: zod.string({
            invalid_type_error: "Tipo de dato invalido se esperaba un string",
            required_error: "La ubicacion es obligatoria"
        }).nonempty(),
        
        resguardatario: zod.string({
            invalid_type_error: "El valor debe ser un string"
        }).optional(),
    
        no_interno_DCC: zod.string({
            invalid_type_error: "El valor debe ser un string"
        }).optional(),
    
        fecha_ultima_revision: zod.string({
            invalid_type_error: "El valor debe ser un string"
        })
            .trim()
            .regex(/^\d{4}-\d{2}-\d{2}$/, {
                message: "Formato de fecha inválido (YYYY-MM-DD)"
            })
            .refine(
                val => !isNaN(new Date(val).getTime()),
                { message: "Fecha inválida" }
            ).refine(val => new Date(val) <= new Date(), { message: "No se permite fecha futura" })
            .optional(),
        
        no_oficio_traspaso: zod.string({
            invalid_type_error: "El valor debe ser un string"
        }).optional(),
    
        id_categoria: zod.number({
            required_error: "La categoria es obligatoria",
            invalid_type_error: "Tipo de dato invalido se esperaba un numero"
        }),
    
        estatus: zod.string({
            invalid_type_error: "El valor debe ser un string"
        }).optional()
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

    return { validRows, errors };
}
