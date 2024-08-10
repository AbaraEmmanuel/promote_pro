// app/api/create-users-table/route.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const result = await sql`
      CREATE TABLE Users (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(255) UNIQUE NOT NULL,
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        points INTEGER DEFAULT 0,
        tasksDone INTEGER DEFAULT 0
      );
    `;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
