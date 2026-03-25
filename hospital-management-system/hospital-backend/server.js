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
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ── Health check ─────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏥 Hospital API is running!',
        version: '1.0.0'
    });
});

// ── 404 handler ──────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Error handler ─────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});