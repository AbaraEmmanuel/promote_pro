require('dotenv').config();
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
const serviceAccount = require('./config/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://promote-pro-8f9aa-default-rtdb.firebaseio.com/'
});

const db = admin.database();

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
        // Fetch user data from Firebase Realtime Database
        const userRef = db.ref(`users/${userId}`);
        userRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                res.json(snapshot.val());
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        });
    } catch (error) {
        console.error('Firebase error:', error);
        res.status(500).json({ error: 'Firebase error' });
    }
});

// Route to update user data
app.post('/update', async (req, res) => {
    const { userId, points, tasksDone, completedTasks } = req.body;
    try {
        // Update user data in Firebase Realtime Database
        const userRef = db.ref(`users/${userId}`);
        await userRef.set({
            points,
            tasks_done: tasksDone,
            completed_tasks: completedTasks
        });
        res.status(200).json({ message: 'User data updated' });
    } catch (error) {
        console.error('Firebase error:', error);
        res.status(500).json({ error: 'Firebase error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
