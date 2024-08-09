const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Dummy in-memory database (use a real database in production)
const userData = {};

app.use(bodyParser.json());

app.get('/data/:userId', (req, res) => {
    const userId = req.params.userId;
    const data = userData[userId] || { points: 0, tasksDone: 0, completedTasks: [] };
    res.json(data);
});

app.post('/update', (req, res) => {
    const { userId, points, tasksDone, completedTasks } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    userData[userId] = { points, tasksDone, completedTasks };
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
