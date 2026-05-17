// backend/src/controllers/authController.js
import {pool} from '../config/db.js';
import { enviarCodigoRecuperacion, enviarCodigoVerificacion } from '../config/email.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi-secreto-super-seguro';

export const authController = {
    //  Enviar código de verificación
    enviarCodigo: async (req, res) => {
        const { email, nombre } = req.body;
        
        try {
            // Generar y guardar código
            const result = await pool.query(
                `SELECT seguridad.generar_codigo($1,$2) AS resultado`,
                [email,nombre]
            );
            
            const resultado = result.rows[0].resultado;
            
            if (!resultado.success) {
                return res.status(resultado.status).json(resultado);
            }
            
            // Enviar email con el código
            const emailEnviado = await enviarCodigoVerificacion(
                email, 
                resultado.data.codigo 
            );
            
            resultado.data.email_enviado = emailEnviado;
            
            res.json(resultado);
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    //   Verificar código y crear usuario
    verificarYRegistrar: async (req, res) => {
        const { email, codigo, password, nombre } = req.body;
        
        try {
            const result = await pool.query(
                `SELECT seguridad.verificar_y_registrar($1, $2, $3, $4, $5) AS resultado`,
                [email, codigo, password, nombre, 1]  // 1 = rol estudiante
            );
            
            const resultado = result.rows[0].resultado;
            res.status(resultado.status || 200).json(resultado);
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    //   Reenviar código
    reenviarCodigo: async (req, res) => {
        const { email } = req.body;
        
        try {
            const result = await pool.query(
                `SELECT seguridad.reenviar_codigo($1) AS resultado`,
                [email]
            );
            
            const resultado = result.rows[0].resultado;

            if (!resultado.success) {
                return res.status(resultado.status).json(resultado);
            }
            
            
                await enviarCodigoVerificacion(email, resultado.data.codigo);
            
            
            res.json(resultado);
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    login: async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query(
            `SELECT seguridad.usuario_login($1, $2) AS resultado`,
            [email, password]
        );
        
        const resultado = result.rows[0].resultado;
        
        if (resultado.success && resultado.data) {
            // Generar token JWT
            const token = jwt.sign(
                { 
                    id_usuario: resultado.data.id_usuario,
                    email: resultado.data.email,
                    rol: resultado.data.rol
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            resultado.data.token = token;
            
        }
        
        res.json(resultado);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
},
    enviarCodigoRecuperacion: async (req, res) => {
        const { email } = req.body;
        
        console.log(' POST /api/auth/forgot-password', { email });
        
        try {
            const result = await pool.query(
                `SELECT seguridad.generar_codigo_recuperacion($1) AS resultado`,
                [email]
            );
            
            const resultado = result.rows[0].resultado;
            console.log('email>>>>>...',result)
            if (resultado.success && resultado.data?.codigo) {
                // Enviar email con el código
                await enviarCodigoRecuperacion(email, resultado.data.codigo);
            }
            
            // No devolvemos el código al cliente en producción
            if (resultado.data) {
                delete resultado.data.codigo;
            }
            
            res.json(resultado);
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    verificarCodigoRecuperacion: async (req, res) => {
        const { email, codigo } = req.body;
        
        try {
            const result = await pool.query(
                `SELECT seguridad.verificar_codigo_recuperacion($1, $2) AS resultado`,
                [email, codigo]
            );
            
            const resultado = result.rows[0].resultado;
            res.json(resultado);
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    cambiarContrasena: async (req, res) => {
        const { email, codigo, nueva_contrasena } = req.body;
        
        try {
            const result = await pool.query(
                `SELECT seguridad.cambiar_contrasena($1, $2, $3) AS resultado`,
                [email, codigo, nueva_contrasena]
            );
            
            const resultado = result.rows[0].resultado;
            res.json(resultado);
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

};