const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ─── Multer Config ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `profile-${req.userId || Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const types = /jpeg|jpg|png/;
        const ext = types.test(path.extname(file.originalname).toLowerCase());
        const mime = types.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only images (jpg, png) are allowed.'));
    }
});

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
                email: email.toLowerCase().trim(),
                profile_photo_url: null
            }
        });
    } catch (err) {
        console.error('❌ Register error detail:', err);
        return res.status(500).json({ error: `Registration error: ${err.message}` });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { identifier, email, password } = req.body;
    const loginId = identifier || email; // Backward compatibility

    if (!loginId || !password) {
        return res.status(400).json({ error: 'Email/Username and password are required.' });
    }

    try {
        const userRes = await db.query(
            'SELECT * FROM users WHERE email = $1 OR username = $1',
            [loginId.toLowerCase().trim()]
        );

        const user = userRes.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid identifier or password.' });
        }

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid identifier or password.' });
        }

        const token = generateToken(user.id);
        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile_photo_url: user.profile_photo_url,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error('❌ Login error detail:', err);
        return res.status(500).json({ error: `Login error: ${err.message}` });
    }
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
const { verifyToken } = require('../middleware/auth');

router.put('/profile', verifyToken, upload.single('profile_photo'), async (req, res) => {
    const { username, password } = req.body;
    const profilePhotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!username && !password && !profilePhotoUrl) {
        return res.status(400).json({ error: 'Provide something to update.' });
    }
    
    // ... validation for username and password ...
    if (username && (username.trim().length < 1 || username.trim().length > 30)) {
        return res.status(400).json({ error: 'Username must be 1–30 characters.' });
    }
    if (password && password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    try {
        if (username) {
            const existing = await db.query(
                'SELECT id FROM users WHERE username = $1 AND id != $2',
                [username.trim(), req.userId]
            );
            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'Username is already taken.' });
            }
        }

        let updateQuery, params;
        const currentRes = await db.query('SELECT * FROM users WHERE id=$1', [req.userId]);
        const current = currentRes.rows[0];

        const newUsername = username ? username.trim() : current.username;
        const newPasswordHash = password ? bcrypt.hashSync(password, 12) : current.password_hash;
        const newPhotoUrl = profilePhotoUrl ? profilePhotoUrl : current.profile_photo_url;

        updateQuery = 'UPDATE users SET username=$1, password_hash=$2, profile_photo_url=$3 WHERE id=$4 RETURNING id, username, email, profile_photo_url, created_at';
        params = [newUsername, newPasswordHash, newPhotoUrl, req.userId];

        const result = await db.query(updateQuery, params);
        const updated = result.rows[0];

        return res.status(200).json({
            message: 'Profile updated successfully.',
            user: { 
                id: updated.id, 
                username: updated.username, 
                email: updated.email, 
                profile_photo_url: updated.profile_photo_url,
                created_at: updated.created_at
            }
        });
    } catch (err) {
        console.error('❌ Profile update error:', err);
        return res.status(500).json({ error: `Profile update error: ${err.message}` });
    }
});

module.exports = router;
