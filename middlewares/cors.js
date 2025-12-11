import cors from 'cors';

const ACEPTED_ORIGINS = [
    'http://172.16.78.32:5173',
    'http://localhost:5173'
]

    /* const origin = req.header('origin') 
    if (ACEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } */

export const corsMiddleware = ({ acceptedOrigins = ACEPTED_ORIGINS } = {}) => cors({
    origin: (origin, callback) => {
        /* 
            ¿Qué es origin en esa función?
            origin no lo defines tú. Lo pasa automáticamente la librería cors 
            leyendo la cabecera Origin que el navegador incluye en cada 
            petición que hace a tu servidor.
            Ejemplo real de cabecera:
                Origin: http://localhost:3000

            ¿Qué es callback?
            Es una función que Express y la librería cors usan internamente.
            Tú le pasas:
                null, true → ✅ para permitir
                Error(...) → ❌ para rechazar
        */
        
        if (acceptedOrigins.includes(origin)) {
            return callback(null, true);
        }

        if (!origin) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'))
    }
})