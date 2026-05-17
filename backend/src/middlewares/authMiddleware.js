// backend/src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi-secreto-super-seguro';

export const authMiddleware = async (req, res, next) => {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
        // Usuario no autenticado pero permitimos continuar (acceso público)
        req.usuario = { id_usuario: null };
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = { 
            id_usuario: decoded.id_usuario,
            email: decoded.email,
            rol: decoded.rol
        };
        next();
    } catch (error) {
        // Token inválido
        req.usuario = { id_usuario: null };
        next();
    }
};

// Middleware para rutas que requieren autenticación obligatoria
export const requireAuth = (req, res, next) => {
    if (!req.usuario?.id_usuario) {
        return res.status(401).json({
            success: false,
            message: 'Debes iniciar sesión para realizar esta acción'
        });
    }
    next();
};

// Middleware para verificar roles específicos
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.usuario?.id_usuario) {
            return res.status(401).json({
                success: false,
                message: 'Debes iniciar sesión'
            });
        }
        
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }
        
        next();
    };
};