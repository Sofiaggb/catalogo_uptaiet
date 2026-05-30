// backend/src/middlewares/auditMiddleware.js
import {pool} from '../config/db.js';

export const auditMiddleware = async (req, res, next) => {
    //    console.log(' ========== AUDIT MIDDLEWARE EJECUTÁNDOSE ==========');
    // console.log('URL:', req.method, req.url);
    // console.log('Usuario en req:', req.usuario);
    try {
        // Obtener ID del usuario (desde el token/sesión)
        const userId = req.usuario?.id_usuario || null;
        
        // Obtener IP real (considerando proxies)
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   null;
        
        // Obtener User Agent
        const userAgent = req.headers['user-agent'] || null;
        
        console.log(' Audit Middleware:', { userId, ip, userAgent: userAgent?.substring(0, 50) });
        
        // Establecer variables de sesión en PostgreSQL
        if (pool) {
            // Usar set_config con contexto de sesión (false = solo para esta sesión)
            await pool.query('SELECT set_config($1, $2, false)', ['app.current_user_id', userId?.toString() || null]);
            await pool.query('SELECT set_config($1, $2, false)', ['app.current_ip', ip]);
            await pool.query('SELECT set_config($1, $2, false)', ['app.current_user_agent', userAgent]);
            
            // Verificar que se guardaron
            const checkResult = await pool.query(`
                SELECT 
                    current_setting('app.current_user_id', true) as user_id,
                    current_setting('app.current_ip', true) as ip,
                    current_setting('app.current_user_agent', true) as user_agent
            `);
            console.log('Variables guardadas:', checkResult.rows[0]);
        }
        
    } catch (error) {
        console.error(' Error en auditMiddleware:', error);
    }
    
    next();
};