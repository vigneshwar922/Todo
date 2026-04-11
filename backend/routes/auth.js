const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    try {
        // Check uniqueness
        const existingUserRes = await db.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email.toLowerCase().trim(), username.trim()]
        );

        if (existingUserRes.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email or username already exists.' });
        }

        // Hash password and insert
        const passwordHash = bcrypt.hashSync(password, 12);
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username.trim(), email.toLowerCase().trim(), passwordHash]
        );

        const userId = result.rows[0].id;
        const token = generateToken(userId);

        return res.status(201).json({
            message: 'Account created successfully.',
            token,
            user: {
                id: userId,
                username: username.trim(),
                email: email.toLowerCase().trim()
            }
        });
    } catch (err) {
        console.error('❌ Register error detail:', err);
        return res.status(500).json({ error: `Registration error: ${err.message}` });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const userRes = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        const user = userRes.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = generateToken(user.id);
        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('❌ Login error detail:', err);
        return res.status(500).json({ error: `Login error: ${err.message}` });
    }
});

module.exports = router;
