import z from 'zod';

const articleSchema = z.object({
    no_inventario: z
        .string("Tipo de dato invalido se esperaba un texto")
        .trim()
        .nonempty("El No. de inventario es obligatorio"),  //esto valida que no venga vacia la cadena o arreglo | "", [] no pasan

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
        .string("El valor debe ser un texto")
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

export function validateArticle(object) {
    return articleSchema.safeParse(object);
}

export function validatePartialArticle(object) {
    return articleSchema.partial().safeParse(object);
}

/*
    z.number().min(0)          // no negativos
    z.number().min(1)          // IDs, contadores
    z.number().int()           // si debe ser entero
    z.number().max(120)        // edad humana

    z.number()
    Esto ya protege contra:
        string
        null
        undefined
        object
        array

    2️⃣ Evitar NaN (esto es CLAVE)
    z NO lo bloquea solo.
 
    const safeNumber = z.number().refine(
        n => Number.isFinite(n),
        { message: "Número inválido" }
    );
    Esto bloquea:
        NaN
        Infinity
        -Infinity




## 🧠 Principio base para strings

Un string puede ser:

* `""` (vacío)
* `"   "` (solo espacios)
* `"DROP TABLE users"`
* extremadamente largo
* de un tipo que **no es string**

👉 **Nunca asumas que un string es válido solo porque “existe”**.

---

## ✅ Validaciones MÍNIMAS que deberías aplicar a strings

### 1️⃣ Validar que sea string
z.string()

Bloquea:

* `number`
* `null`
* `undefined`
* `object`
* `array`

---

### 2️⃣ Evitar vacío (`""`)

z.string().min(1)

o

z.string().nonempty()
```

📌 **Ambos hacen lo mismo**, `nonempty()` es solo semántico.

---

### 3️⃣ Evitar strings con solo espacios (MUY IMPORTANTE)

z.string().trim().min(1)

✔️ `"   "` → ❌
✔️ `" hola "` → `"hola"`

---

### 4️⃣ Limitar longitud (SIEMPRE)

Esto evita:

* abusos
* payloads gigantes
* problemas en DB

z.string().min(1).max(255)
```

Ejemplos reales:

* nombre → 100
* email → 254
* textarea → 2000

---

### 5️⃣ Formato (cuando aplique)

z.string().email()
z.string().uuid()
z.string().url()
z.string().regex(/^[a-z0-9_-]+$/i)
```

Ejemplo:

username: z.string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_]+$/i)

---

### 6️⃣ Campo opcional vs obligatorio

Igual que números:

#### Obligatorio:

z.string().trim().min(1)
```

#### Opcional:

z.string().trim().min(1).optional()
```

🚨 Esto permite:

* no venga
* pero **si viene**, debe ser válido

---

### 7️⃣ Nullable (solo si lo necesitas)

z.string().nullable()
```

⚠️ No mezclar por costumbre con `optional`.

---

## 🔥 Patrón BACKEND RECOMENDADO (string seguro)

### 🔒 String base seguro

const secureString = z
  .string()
  .trim()
  .min(1)
  .max(255);
```

Luego especializas:

const nameSchema = secureString.max(100);

const emailSchema = secureString.email();

const slugSchema = secureString.regex(/^[a-z0-9-]+$/);

const descriptionSchema = secureString.max(2000).optional();
```

---

## 🧪 Ejemplo real de API robusta

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  bio: z.string().trim().max(500).optional(),
});

---

## 🛡️ ¿Y si mandan basura o ataques?

Ejemplos:

{
  "name": "   ",
  "email": "not-an-email",
  "bio": "<script>alert(1)</script>"
}

✔️ z lo bloquea (o normaliza)
✔️ No rompe la app
✔️ No llega a la lógica de negocio

📌 **z valida**, **NO sanitiza** (XSS se maneja en otro nivel).

---

## 📋 Checklist mental para strings

✅ `z.string()`
✅ `.trim()`
✅ `.min(1)`
✅ `.max(n)`
✅ formato (`email`, `regex`, etc.)
✅ `.optional()` si aplica

---

## 🎯 Resumen ultra corto

> String seguro en backend:

z.string().trim().min(1).max(255)
```

---

Si quieres, el siguiente paso lógico es:

* **arrays**
* **objects anidados**
* **enums**
* **schemas compartidos front ↔ back**

*/