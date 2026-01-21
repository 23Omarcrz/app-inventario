import nodemailer from "nodemailer";
import 'dotenv/config'

export async function sendEmail({ to, subject, html }) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // ej: smtp.gmail.com
        port: process.env.EMAIL_PORT, // 587
        secure: false,                // true solo si es 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"Inventario App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
}
