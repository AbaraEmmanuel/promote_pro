const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/telegramApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define a schema and model for user data
const userSchema = new mongoose.Schema({
    userId: Number,
    points: { type: Number, default: 0 },
    tasksDone: { type: Number, default: 0 },
    completedTasks: [String] // Store completed task IDs
});

const User = mongoose.model('User', userSchema);

// Fetch user data
app.get('/data/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const user = await User.findOne({ userId });
    res.json(user || { points: 0, tasksDone: 0, completedTasks: [] });
});

// Update user data
app.post('/update', async (req, res) => {
    const { userId, points, tasksDone, completedTasks } = req.body;
    await User.findOneAndUpdate(
        { userId },
        { points, tasksDone, completedTasks },
        { upsert: true }
    );
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
