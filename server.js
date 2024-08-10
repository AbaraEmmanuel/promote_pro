const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');  // Import your db.js

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Fetch user data from PostgreSQL
app.get('/data/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user data in PostgreSQL
app.post('/update', async (req, res) => {
  const { userId, points, tasksDone, completedTasks } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await db.query(
      'INSERT INTO users (id, points, tasks_done, completed_tasks) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET points = $2, tasks_done = $3, completed_tasks = $4',
      [userId, points, tasksDone, JSON.stringify(completedTasks)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
