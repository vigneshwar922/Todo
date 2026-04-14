const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(verifyToken);

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
// Query params: ?date=YYYY-MM-DD, ?filter=all|active|completed, ?search=text, ?sort=date_asc|date_desc
router.get('/', async (req, res) => {
    const { date, filter, search, sort } = req.query;
    const userId = req.userId;

    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];

    // Filter by date
    if (date) {
        query += ` AND date = $${params.length + 1}`;
        params.push(date);
    }

    // Filter by completion status
    if (filter === 'active') {
        query += ' AND is_completed = FALSE';
    } else if (filter === 'completed') {
        query += ' AND is_completed = TRUE';
    }

    // Server-side search on title and tag
    if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query += ` AND (title LIKE $${params.length + 1} OR tag LIKE $${params.length + 2})`;
        params.push(searchTerm, searchTerm);
    }

    // Sorting
    if (sort === 'date_asc') {
        query += ' ORDER BY created_at ASC';
    } else {
        query += ' ORDER BY created_at DESC'; // default including date_desc
    }

    try {
        const result = await db.query(query, params);
        return res.status(200).json({ tasks: result.rows });
    } catch (err) {
        console.error('GET /tasks error:', err);
        return res.status(500).json({ error: 'Failed to retrieve tasks.' });
    }
});

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { title, priority = 'low', tag = '', date } = req.body;
    const userId = req.userId;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Task title is required.' });
    }

    if (!date) {
        return res.status(400).json({ error: 'Task date is required.' });
    }

    // Sanitize input
    const safeTitle = title.trim().substring(0, 500);
    const safeTag = (tag || '').trim().substring(0, 50);
    const safePriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'low';

    try {
        const result = await db.query(
            'INSERT INTO tasks (user_id, title, priority, tag, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, safeTitle, safePriority, safeTag, date]
        );

        return res.status(201).json({
            message: 'Task created.',
            task: result.rows[0]
        });
    } catch (err) {
        console.error('POST /tasks error:', err);
        return res.status(500).json({ error: 'Failed to create task.' });
    }
});

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { title, is_completed, priority, tag } = req.body;

    try {
        // Ensure task belongs to user
        const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
        const task = taskRes.rows[0];
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Build update fields
        const updatedTitle = title !== undefined ? title.trim().substring(0, 500) : task.title;
        const updatedCompleted = is_completed !== undefined ? !!is_completed : task.is_completed;
        const updatedPriority = priority !== undefined
            ? (['low', 'medium', 'high'].includes(priority) ? priority : task.priority)
            : task.priority;
        const updatedTag = tag !== undefined ? tag.trim().substring(0, 50) : task.tag;

        const updateResult = await db.query(
            'UPDATE tasks SET title = $1, is_completed = $2, priority = $3, tag = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
            [updatedTitle, updatedCompleted, updatedPriority, updatedTag, id, userId]
        );

        return res.status(200).json({
            message: 'Task updated.',
            task: updateResult.rows[0]
        });
    } catch (err) {
        console.error('PUT /tasks/:id error:', err);
        return res.status(500).json({ error: 'Failed to update task.' });
    }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Ensure task belongs to user
        const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
        if (taskRes.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
        return res.status(200).json({ message: 'Task deleted.' });
    } catch (err) {
        console.error('DELETE /tasks/:id error:', err);
        return res.status(500).json({ error: 'Failed to delete task.' });
    }
});

module.exports = router;
