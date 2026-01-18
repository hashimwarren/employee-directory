import { NextResponse } from 'next/server';
import { initializeDatabase, seedEmployees } from '@/lib/db';

export async function POST() {
  try {
    await initializeDatabase();
    await seedEmployees();
    return NextResponse.json({ success: true, message: '20 employees seeded successfully' });
  } catch (error) {
    console.error('Failed to seed employees:', error);
    return NextResponse.json({ error: 'Failed to seed employees' }, { status: 500 });
  }
}
