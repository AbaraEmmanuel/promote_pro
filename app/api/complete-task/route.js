// app/api/complete-task/route.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { userId, taskId } = await request.json();

  try {
    const result = await sql`
      INSERT INTO Tasks (userId, taskId, completed)
      VALUES (${userId}, ${taskId}, TRUE)
      ON CONFLICT (userId, taskId)
      DO UPDATE SET completed = TRUE;
    `;

    // Update points and tasks done in Users table
    await sql`
      UPDATE Users
      SET points = points + 10, tasksDone = tasksDone + 1
      WHERE userId = ${userId};
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
