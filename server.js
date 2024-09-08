require('dotenv').config();

const express = require('express');
const admin = require('firebase-admin');

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
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    })
});

const app = express();
app.use(express.json());

const db = admin.firestore();

// Route to update user data in Firebase Firestore
app.post('/update', async (req, res) => {
    const { userId, points, tasksDone, completedTasks } = req.body;

    try {
        await db.collection('users').doc(userId).set({
            points,
            tasks_done: tasksDone,
            completed_tasks: completedTasks
        }, { merge: true });
        res.status(200).json({ message: 'User data updated in Firestore' });
    } catch (error) {
        console.error('Firestore error:', error);
        res.status(500).json({ error: 'Firestore error' });
    }
});

// Route to fetch user data from Firebase Firestore
app.get('/data/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            res.status(404).json({ error: 'User data not found' });
        } else {
            res.status(200).json(userDoc.data());
        }
    } catch (error) {
        console.error('Firestore error:', error);
        res.status(500).json({ error: 'Firestore error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000; // Use environment variable for port if available
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
