require('dotenv').config();
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
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
