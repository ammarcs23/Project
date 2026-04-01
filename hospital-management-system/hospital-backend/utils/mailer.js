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

const header = `
<div style="background:linear-gradient(120deg,#0d4f4f,#14b8a6);padding:28px 32px;text-align:center;">
    <div style="font-size:32px;margin-bottom:8px;">🏥</div>
    <div style="color:white;font-size:22px;font-weight:800;">MediCare+</div>
    <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Hospital Management System</div>
</div>`;

const footer = `
<div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
    <div style="font-size:11px;color:#94a3b8;">© 2024 MediCare+ · Do not reply to this email</div>
</div>`;

const otpBox = (otp, label) => `
<div style="background:white;border:2px dashed #14b8a6;border-radius:14px;padding:22px;text-align:center;margin:20px 0;">
    <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">${label}</div>
    <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#0d4f4f;font-family:monospace;">${otp}</div>
    <div style="font-size:12px;color:#94a3b8;margin-top:8px;">Expires in 10 minutes</div>
</div>`;

// ── Registration verification OTP ────────────────────
const sendOTPEmail = async (toEmail, toName, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `MediCare+ <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🏥 MediCare+ — Email Verification Code',
        html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#f0fdfb;border-radius:16px;overflow:hidden;border:1px solid #ccfbf1;">
            ${header}
            <div style="padding:28px 32px;">
                <p style="font-size:15px;color:#0f172a;font-weight:700;margin:0 0 6px;">Hello, ${toName}! 👋</p>
                <p style="font-size:13px;color:#475569;margin:0 0 4px;line-height:1.6;">
                    Enter this code to verify your email and complete registration:
                </p>
                ${otpBox(otp, 'Verification Code')}
                <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;">
                    If you did not create a MediCare+ account, ignore this email.
                </p>
            </div>
            ${footer}
        </div>`,
    });
};

// ── Forgot password reset OTP ─────────────────────────
const sendResetEmail = async (toEmail, toName, otp, role) => {
    const roleLabel = role === 'doctor' ? '👨‍⚕️ Doctor' : role === 'admin' ? '🔐 Admin' : '🧑‍⚕️ Patient';
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `MediCare+ <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔑 MediCare+ — Password Reset Code',
        html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#fff7ed;border-radius:16px;overflow:hidden;border:1px solid #fed7aa;">
            ${header}
            <div style="padding:28px 32px;">
                <p style="font-size:15px;color:#0f172a;font-weight:700;margin:0 0 6px;">Hello, ${toName}! 🔑</p>
                <p style="font-size:13px;color:#475569;margin:0 0 4px;line-height:1.6;">
                    A password reset was requested for your <strong>${roleLabel}</strong> account.<br/>
                    Enter this code to reset your password:
                </p>
                ${otpBox(otp, 'Reset Code')}
                <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:12px 16px;margin-bottom:16px;">
                    <p style="font-size:12px;color:#92400e;margin:0;line-height:1.6;">
                        ⚠️ If you did not request a password reset, your account may be at risk.<br/>
                        Please ignore this email and consider changing your password.
                    </p>
                </div>
            </div>
            ${footer}
        </div>`,
    });
};

module.exports = { sendOTPEmail, sendResetEmail };