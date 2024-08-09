const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./config/firebase-service-account-key.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://promote-pro-8f9aa.firebaseio.com"  // Replace with your database URL
});

const db = admin.firestore();
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Fetch user data from Firestore
app.get('/data/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const userDoc = db.collection('users').doc(userId);
    const doc = await userDoc.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(doc.data());
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user data in Firestore
app.post('/update', async (req, res) => {
  const { userId, points, tasksDone, completedTasks } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const userDoc = db.collection('users').doc(userId);
    await userDoc.set({
      points,
      tasksDone,
      completedTasks
    }, { merge: true }); // Merge updates with existing document
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
