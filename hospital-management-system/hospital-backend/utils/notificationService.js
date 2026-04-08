const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter (tumhara existing setup)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send appointment confirmation email
 */
const sendAppointmentEmail = async (patientEmail, appointmentDetails) => {
    const { patientName, doctorName, date, time, department } = appointmentDetails;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patientEmail,
        subject: '✅ Appointment Confirmed - Hospital Management System',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .appointment-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
                    .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; width: 150px; color: #667eea; }
                    .detail-value { flex: 1; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 Appointment Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${patientName}</strong>,</p>
                        <p>Your appointment has been successfully booked. Here are your appointment details:</p>
                        
                        <div class="appointment-card">
                            <div class="detail-row">
                                <div class="detail-label">Doctor:</div>
                                <div class="detail-value">Dr. ${doctorName}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Department:</div>
                                <div class="detail-value">${department}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Date:</div>
                                <div class="detail-value">${date}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Time:</div>
                                <div class="detail-value">${time}</div>
                            </div>
                        </div>

                        <p><strong>Important Notes:</strong></p>
                        <ul>
                            <li>Please arrive 10 minutes before your scheduled time</li>
                            <li>Bring your medical records and previous prescriptions</li>
                            <li>In case of emergency, contact the hospital immediately</li>
                        </ul>

                        <p style="text-align: center;">
                            <a href="#" class="button">View Appointment Details</a>
                        </p>

                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                            <p>&copy; 2026 Hospital Management System. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Appointment email sent successfully to:', patientEmail);
        return { success: true, message: 'Email sent' };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send appointment confirmation SMS
 */
const sendAppointmentSMS = async (phoneNumber, appointmentDetails) => {
    const { patientName, doctorName, date, time } = appointmentDetails;

    // Format phone number for Twilio (must include country code)
    // Pakistan ka code +92 hai
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
        // Agar user ne 03001234567 format mein diya hai
        if (phoneNumber.startsWith('0')) {
            formattedPhone = '+92' + phoneNumber.substring(1);
        } else {
            formattedPhone = '+92' + phoneNumber;
        }
    }

    const message = `
🏥 Appointment Confirmed!

Dear ${patientName},
Your appointment has been booked:

👨‍⚕️ Doctor: Dr. ${doctorName}
📅 Date: ${date}
🕐 Time: ${time}

Please arrive 10 mins early.
Contact hospital for any queries.

- Hospital Management System
    `.trim();

    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        console.log('✅ SMS sent successfully. SID:', result.sid);
        return { success: true, message: 'SMS sent', sid: result.sid };
    } catch (error) {
        console.error('❌ Error sending SMS:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send both email and SMS
 */
const sendAppointmentNotifications = async (patientEmail, phoneNumber, appointmentDetails) => {
    const results = {
        email: null,
        sms: null
    };

    // Send email
    if (patientEmail) {
        results.email = await sendAppointmentEmail(patientEmail, appointmentDetails);
    }

    // Send SMS
    if (phoneNumber) {
        results.sms = await sendAppointmentSMS(phoneNumber, appointmentDetails);
    }

    return results;
};

module.exports = {
    sendAppointmentEmail,
    sendAppointmentSMS,
    sendAppointmentNotifications
};