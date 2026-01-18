import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let sql: NeonQueryFunction<false, false> | null = null;

function getSQL() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl === 'your_neon_connection_string_here') {
      throw new Error('DATABASE_URL is not configured. Please set it in .env.local');
    }
    sql = neon(dbUrl);
  }
  return sql;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  photo_url: string;
  created_at: Date;
  updated_at: Date;
}

export async function initializeDatabase() {
  const db = getSQL();
  await db`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      department VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      photo_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  // Add photo_url column if it doesn't exist (for existing tables)
  await db`
    ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500)
  `;
}

export async function getEmployees(): Promise<Employee[]> {
  const db = getSQL();
  const result = await db`SELECT * FROM employees ORDER BY name`;
  return result as Employee[];
}

export async function getEmployee(id: number): Promise<Employee | null> {
  const db = getSQL();
  const result = await db`SELECT * FROM employees WHERE id = ${id}`;
  return result[0] as Employee | null;
}

export async function createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
  const db = getSQL();
  const result = await db`
    INSERT INTO employees (name, email, department, position, phone, photo_url)
    VALUES (${employee.name}, ${employee.email}, ${employee.department}, ${employee.position}, ${employee.phone}, ${employee.photo_url || ''})
    RETURNING *
  `;
  return result[0] as Employee;
}

export async function updateEmployee(id: number, employee: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>): Promise<Employee | null> {
  const db = getSQL();
  const result = await db`
    UPDATE employees
    SET
      name = COALESCE(${employee.name}, name),
      email = COALESCE(${employee.email}, email),
      department = COALESCE(${employee.department}, department),
      position = COALESCE(${employee.position}, position),
      phone = COALESCE(${employee.phone}, phone),
      photo_url = COALESCE(${employee.photo_url}, photo_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as Employee | null;
}

export async function deleteEmployee(id: number): Promise<boolean> {
  const db = getSQL();
  const result = await db`DELETE FROM employees WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

export async function seedEmployees(): Promise<void> {
  const db = getSQL();

  const employees = [
    { name: 'Sarah Chen', email: 'sarah.chen@company.com', department: 'Engineering', position: 'Senior Software Engineer', phone: '555-0101', photo_url: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Marcus Johnson', email: 'marcus.johnson@company.com', department: 'Engineering', position: 'Tech Lead', phone: '555-0102', photo_url: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com', department: 'Design', position: 'UX Designer', phone: '555-0103', photo_url: 'https://i.pravatar.cc/150?img=5' },
    { name: 'David Kim', email: 'david.kim@company.com', department: 'Engineering', position: 'Backend Developer', phone: '555-0104', photo_url: 'https://i.pravatar.cc/150?img=7' },
    { name: 'Jessica Martinez', email: 'jessica.martinez@company.com', department: 'Marketing', position: 'Marketing Manager', phone: '555-0105', photo_url: 'https://i.pravatar.cc/150?img=9' },
    { name: 'Michael Brown', email: 'michael.brown@company.com', department: 'Sales', position: 'Sales Director', phone: '555-0106', photo_url: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Amanda Wilson', email: 'amanda.wilson@company.com', department: 'HR', position: 'HR Manager', phone: '555-0107', photo_url: 'https://i.pravatar.cc/150?img=13' },
    { name: 'James Taylor', email: 'james.taylor@company.com', department: 'Finance', position: 'Financial Analyst', phone: '555-0108', photo_url: 'https://i.pravatar.cc/150?img=15' },
    { name: 'Olivia Anderson', email: 'olivia.anderson@company.com', department: 'Engineering', position: 'Frontend Developer', phone: '555-0109', photo_url: 'https://i.pravatar.cc/150?img=16' },
    { name: 'Robert Thomas', email: 'robert.thomas@company.com', department: 'Operations', position: 'Operations Manager', phone: '555-0110', photo_url: 'https://i.pravatar.cc/150?img=17' },
    { name: 'Sophia Lee', email: 'sophia.lee@company.com', department: 'Design', position: 'Product Designer', phone: '555-0111', photo_url: 'https://i.pravatar.cc/150?img=20' },
    { name: 'William Garcia', email: 'william.garcia@company.com', department: 'Engineering', position: 'DevOps Engineer', phone: '555-0112', photo_url: 'https://i.pravatar.cc/150?img=51' },
    { name: 'Emma White', email: 'emma.white@company.com', department: 'Marketing', position: 'Content Strategist', phone: '555-0113', photo_url: 'https://i.pravatar.cc/150?img=23' },
    { name: 'Daniel Harris', email: 'daniel.harris@company.com', department: 'Engineering', position: 'QA Engineer', phone: '555-0114', photo_url: 'https://i.pravatar.cc/150?img=52' },
    { name: 'Ava Clark', email: 'ava.clark@company.com', department: 'Sales', position: 'Account Executive', phone: '555-0115', photo_url: 'https://i.pravatar.cc/150?img=25' },
    { name: 'Christopher Lewis', email: 'chris.lewis@company.com', department: 'Engineering', position: 'Software Architect', phone: '555-0116', photo_url: 'https://i.pravatar.cc/150?img=53' },
    { name: 'Mia Robinson', email: 'mia.robinson@company.com', department: 'HR', position: 'Recruiter', phone: '555-0117', photo_url: 'https://i.pravatar.cc/150?img=27' },
    { name: 'Andrew Walker', email: 'andrew.walker@company.com', department: 'Finance', position: 'Controller', phone: '555-0118', photo_url: 'https://i.pravatar.cc/150?img=54' },
    { name: 'Isabella Hall', email: 'isabella.hall@company.com', department: 'Design', position: 'UI Designer', phone: '555-0119', photo_url: 'https://i.pravatar.cc/150?img=29' },
    { name: 'Joseph Young', email: 'joseph.young@company.com', department: 'Engineering', position: 'Data Engineer', phone: '555-0120', photo_url: 'https://i.pravatar.cc/150?img=55' },
  ];

  for (const emp of employees) {
    await db`
      INSERT INTO employees (name, email, department, position, phone, photo_url)
      VALUES (${emp.name}, ${emp.email}, ${emp.department}, ${emp.position}, ${emp.phone}, ${emp.photo_url})
      ON CONFLICT (email) DO NOTHING
    `;
  }
}
