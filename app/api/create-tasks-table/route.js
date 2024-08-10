// app/api/create-tasks-table/route.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const result = await sql`
      CREATE TABLE Tasks (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(255) REFERENCES Users(userId),
        taskId VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      );
    `;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
