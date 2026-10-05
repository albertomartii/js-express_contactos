const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT || '2525'),
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
        }
    });
};

const sendVerificationEmail = async (email, token, hostUrl) => {
    const transporter = createTransporter();
    const verificationLink = `${hostUrl}/verify/email?token=${token}`;

    const mailOptions = {
        from: '"Express Contactos" <no-reply@expresscontactos.local>',
        to: email,
        subject: 'Confirma tu correo electrónico',
        html: `
            <h2>¡Bienvenido a Express Contactos!</h2>
            <p>Por favor, confirma tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
        `
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = {
    sendVerificationEmail
};
