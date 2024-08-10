// app/api/get-user-data/route.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const result = await sql`
      SELECT * FROM Users WHERE userId = ${userId};
    `;
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
