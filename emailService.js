const nodemailer = require('nodemailer');

const sendNewPasswordEmail = async (email, newPassword) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: 'softwarera.tdea@outlook.com',
                pass: 'TdeA*2024'
            }
        });

        const mailOptions = {
            from: 'softwarera.tdea@outlook.com',
            to: email,
            subject: 'Nueva Contraseña Software RA',
            text: `Tu nueva contraseña es: ${newPassword}. Por favor cámbiala después de iniciar sesión.`
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo electrónico enviado con éxito.');
        return true; // Correo electrónico enviado exitosamente
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        return false; // Error al enviar el correo electrónico
    }
};

module.exports = { sendNewPasswordEmail };