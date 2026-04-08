require('dotenv').config();
const { sendAppointmentNotifications } = require('./utils/notificationService');

// Test notification
const testNotification = async () => {
    console.log('🧪 Testing Notification Service...\n');

    const testAppointmentDetails = {
        patientName: 'Ammar Jahangir',
        doctorName: 'Ahmed Khan',
        date: '2026-04-15',
        time: '10:00 AM',
        department: 'Cardiology'
    };

    // Apna email aur phone number yahan dalo
    const testEmail = 'ammarmalik5535@gmail.com';  // ← Apna email dalo
    const testPhone = '+923305097047';          // ← Apna verified number dalo (Twilio mein jo verify kiya hai)

    try {
        const results = await sendAppointmentNotifications(
            testEmail,
            testPhone,
            testAppointmentDetails
        );

        console.log('\n📊 Results:');
        console.log('Email:', results.email);
        console.log('SMS:', results.sms);
        
        if (results.email?.success) {
            console.log('✅ Email sent successfully!');
        } else {
            console.log('❌ Email failed:', results.email?.error);
        }

        if (results.sms?.success) {
            console.log('✅ SMS sent successfully!');
        } else {
            console.log('❌ SMS failed:', results.sms?.error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

testNotification();