// hospital-backend/utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (toEmail, toName, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || `MediCare+ <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🏥 MediCare+ — Your Verification Code',
        html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#f0fdfb;border-radius:16px;overflow:hidden;border:1px solid #ccfbf1;">
            <div style="background:linear-gradient(120deg,#0d4f4f,#14b8a6);padding:28px 32px;text-align:center;">
                <div style="font-size:32px;margin-bottom:8px;">🏥</div>
                <div style="color:white;font-size:22px;font-weight:800;">MediCare+</div>
                <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Hospital Management System</div>
            </div>
            <div style="padding:32px;">
                <p style="font-size:15px;color:#0f172a;font-weight:700;margin:0 0 6px;">Hello, ${toName}! 👋</p>
                <p style="font-size:13px;color:#475569;margin:0 0 24px;line-height:1.6;">
                    Your email verification code for MediCare+ patient registration:
                </p>
                <div style="background:white;border:2px dashed #14b8a6;border-radius:14px;padding:22px;text-align:center;margin-bottom:24px;">
                    <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#0d4f4f;font-family:monospace;">${otp}</div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:8px;">Expires in 10 minutes</div>
                </div>
                <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;">
                    If you did not request this, please ignore this email. Do not share this code with anyone.
                </p>
            </div>
            <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                <div style="font-size:11px;color:#94a3b8;">© 2024 MediCare+ · Hospital Management System</div>
            </div>
        </div>`,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };