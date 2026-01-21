import rateLimit from "express-rate-limit";

export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 solicitudes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Demasiados intentos. Intenta de nuevo más tarde."
    }
});
