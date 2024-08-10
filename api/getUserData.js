import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../config/firebase-service-account-key.json'; // Adjust the path as needed

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export default async function handler(req, res) {
  const { userId } = req.query;

  try {
    const userDoc = db.collection('users').doc(userId);
    const doc = await userDoc.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
