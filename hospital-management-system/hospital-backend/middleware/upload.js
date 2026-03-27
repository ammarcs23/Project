const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Uploads folder banana agar nahi hai
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // unique naam: timestamp + original extension
        const ext      = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext     = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime    = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images allowed (jpg, png, webp)'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;