import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../config/firebase-service-account-key.json'; // Adjust the path as needed

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
    }, { merge: true });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
