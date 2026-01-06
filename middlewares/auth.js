import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    console.log("autenticacion impresion de token")
    console.log(token)

    if (!token) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Esto le dice a Express:
        // "Guarda la info del usuario autenticado en la request"
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};
