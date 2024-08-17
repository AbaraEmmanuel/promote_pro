require('dotenv').config();
const express = require('express');
const { sql } = require('@vercel/postgres');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to fetch user data
app.get('/data/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Query to fetch user data from the database
        const result = await sql`
            SELECT points, tasks_done, completed_tasks FROM Users WHERE id = ${userId}
        `;
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to update user data
app.post('/update', async (req, res) => {
    const { userId, points, tasksDone, completedTasks } = req.body;
    try {
        // Query to insert or update user data in the database
        await sql`
            INSERT INTO Users (id, points, tasks_done, completed_tasks)
            VALUES (${userId}, ${points}, ${tasksDone}, ${completedTasks})
            ON CONFLICT (id) DO UPDATE
            SET points = ${points}, tasks_done = ${tasksDone}, completed_tasks = ${completedTasks}
        `;
        res.status(200).json({ message: 'User data updated' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to set up the database table
app.get('/setup', async (req, res) => {
    try {
        // Query to create the Users table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS Users (
                id VARCHAR(255) PRIMARY KEY,
                points INTEGER DEFAULT 0,
                tasks_done INTEGER DEFAULT 0,
                completed_tasks JSONB DEFAULT '[]'::jsonb
            );
        `;
        res.status(200).json({ message: 'Table created successfully' });
    } catch (error) {
        console.error('Database setup error:', error);
        res.status(500).json({ error: 'Database setup error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
