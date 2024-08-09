const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Mock database
const usersData = {};

app.use(bodyParser.json());

// Endpoint to get user data
app.get('/data/:userId', (req, res) => {
    const userId = req.params.userId;
    const user = usersData[userId] || { points: 0, tasksDone: 0, tasks: {} };
    res.json(user);
});

// Endpoint to update user data
app.post('/update', (req, res) => {
    const { userId, points, tasksDone, tasks } = req.body;
    if (!usersData[userId]) {
        usersData[userId] = { points: 0, tasksDone: 0, tasks: {} };
    }
    usersData[userId].points = points;
    usersData[userId].tasksDone = tasksDone;
    usersData[userId].tasks = tasks;
    res.json({ status: 'success' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
