// hospital-backend folder mein yeh file rakho: generateHash.js
// Phir run karo: node generateHash.js

const bcrypt = require('bcryptjs');

async function main() {
    const password = 'ammar007';
    const hash = await bcrypt.hash(password, 10);
    console.log('\n✅ Admin Password Hash:');
    console.log(hash);
    console.log('\n📋 MySQL mein yeh SQL run karo:');
    console.log(`UPDATE users SET password='${hash}' WHERE email='admin@hospital.com';\n`);
}

main();