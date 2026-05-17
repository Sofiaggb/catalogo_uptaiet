// // backend/src/config/email.js
// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// // Verificar conexión
// transporter.verify((error, success) => {
//     if (error) {
//         console.error('Error de conexión con Gmail:', error);
//     } else {
//         console.log(' Conexión con Gmail establecida');
//     }
// });

// export const enviarCodigoVerificacion = async (email, codigo) => {
//     console.log('process.env.EMAIL_USER>>>',process.env.EMAIL_USER)
//     const mailOptions = {
//         from: `"UPTAIET" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: 'Código de verificación - UPTAIET',
//         html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                 <div style="background-color: #000000; padding: 20px; text-align: center;">
//                     <h1 style="color: #FFD700;">UPTAIET</h1>
//                     <p style="color: white;">Catálogo Digital</p>
//                 </div>
//                 <div style="padding: 20px; border: 1px solid #e0e0e0;">
//                     <h2>Verifica tu correo electrónico</h2>
//                     <p>Utiliza el siguiente código para completar tu registro:</p>
//                     <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold;">
//                         ${codigo}
//                     </div>
//                     <p>Este código expira en <strong>15 minutos</strong>.</p>
//                     <p>Si no solicitaste este registro, ignora este mensaje.</p>
//                     <hr />
//                     <p style="color: #666; font-size: 12px;">UPTAIET - Catálogo Digital Universitario</p>
//                 </div>
//             </div>
//         `,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Código enviado a ${email}`);
//         return true;
//     } catch (error) {
//         console.error('Error enviando email:', error);
//         return false;
//     }
// };


// backend/src/config/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Tipos de email disponibles
const TIPO_EMAIL = {
    VERIFICACION: 'verificacion',
    RECUPERACION: 'recuperacion'
};

// Plantillas de email
const getEmailTemplate = (tipo, codigo, nombre = '') => {
    const templates = {
        [TIPO_EMAIL.VERIFICACION]: {
            subject: 'Código de verificación - UPTAIET',
            title: 'Verifica tu correo electrónico',
            message: 'Utiliza el siguiente código para completar tu registro:',
            buttonText: 'Completar registro',
            footerNote: 'Si no solicitaste este registro, ignora este mensaje.'
        },
        [TIPO_EMAIL.RECUPERACION]: {
            subject: 'Recuperación de contraseña - UPTAIET',
            title: 'Recupera tu contraseña',
            message: 'Utiliza el siguiente código para restablecer tu contraseña:',
            buttonText: 'Restablecer contraseña',
            footerNote: 'Si no solicitaste restablecer tu contraseña, ignora este mensaje.'
        }
    };

    return templates[tipo] || templates[TIPO_EMAIL.VERIFICACION];
};

export const enviarCodigo = async (email, codigo, tipo = TIPO_EMAIL.VERIFICACION, nombre = '') => {
    const template = getEmailTemplate(tipo, codigo, nombre);
    
    const mailOptions = {
        from: `"UPTAIET" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: template.subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #000000; padding: 20px; text-align: center;">
                    <h1 style="color: #FFD700;">UPTAIET</h1>
                    <p style="color: white;">Catálogo Digital</p>
                </div>
                <div style="padding: 20px; border: 1px solid #e0e0e0;">
                    <h2>${template.title}</h2>
                    ${nombre ? `<p>Hola <strong>${nombre}</strong>,</p>` : '<p>Hola,</p>'}
                    <p>${template.message}</p>
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold;">
                        ${codigo}
                    </div>
                    <p>Este código expira en <strong>15 minutos</strong>.</p>
                    <p>${template.footerNote}</p>
                    <hr />
                    <p style="color: #666; font-size: 12px;">UPTAIET - Catálogo Digital Universitario</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email ${tipo} enviado a ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando email ${tipo}:`, error);
        return false;
    }
};

// Mantener funciones existentes por compatibilidad
export const enviarCodigoVerificacion = async (email, codigo) => {
    return enviarCodigo(email, codigo, TIPO_EMAIL.VERIFICACION);
};

export const enviarCodigoRecuperacion = async (email, codigo) => {
    return enviarCodigo(email, codigo, TIPO_EMAIL.RECUPERACION);
};