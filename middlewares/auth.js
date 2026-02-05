import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({
            success: false,
            code: "NO_TOKEN",
            message: "No autenticado"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.session = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            code: "INVALID_TOKEN",
            message: "Token no válido"
        });
    }
};
