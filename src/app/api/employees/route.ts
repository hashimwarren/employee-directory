import { NextResponse } from 'next/server';
import { getEmployees, createEmployee } from '@/lib/db';

export async function GET() {
  try {
    const employees = await getEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, department, position, phone } = body;

    if (!name || !email || !department || !position) {
      return NextResponse.json(
        { error: 'Name, email, department, and position are required' },
        { status: 400 }
      );
    }

    const employee = await createEmployee({ name, email, department, position, phone: phone || '' });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Failed to create employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
