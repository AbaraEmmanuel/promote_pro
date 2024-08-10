// app/api/update-user/route.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { userId, firstName, lastName, points, tasksDone } = await request.json();

  try {
    const result = await sql`
      INSERT INTO Users (userId, firstName, lastName, points, tasksDone)
      VALUES (${userId}, ${firstName}, ${lastName}, ${points}, ${tasksDone})
      ON CONFLICT (userId)
      DO UPDATE SET
        points = EXCLUDED.points,
        tasksDone = EXCLUDED.tasksDone;
    `;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
