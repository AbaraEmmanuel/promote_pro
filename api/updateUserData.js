import db from '../../db';  // Adjust the import path as needed

// Update user data in PostgreSQL
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, points, tasksDone, completedTasks } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await db.query(
      'INSERT INTO users (id, points, tasks_done, completed_tasks) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET points = $2, tasks_done = $3, completed_tasks = $4',
      [userId, points, tasksDone, JSON.stringify(completedTasks)]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
