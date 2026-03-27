const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────
const authRoutes  = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/api/auth',  authRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ──────────────────────────────
app.get('/', (req, res) => {
    res.json({ success: true, message: '🏥 Hospital API is running!', version: '1.0.0' });
});

// ── 404 Handler ───────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Error Handler ─────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});