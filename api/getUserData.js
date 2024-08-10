import db from '../../db';  // Adjust the import path as needed

// Fetch user data from PostgreSQL
export default async function handler(req, res) {
  const { userId } = req.query;

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
