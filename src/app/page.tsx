'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeCard } from '@/components/employee-card';
import { EmployeeDialog } from '@/components/employee-dialog';
import { Toaster, toast } from 'sonner';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  photo_url: string;
}

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const departments = [...new Set(employees.map(e => e.department))].sort();

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
        setDbInitialized(true);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeDatabase = async () => {
    try {
      const response = await fetch('/api/init', { method: 'POST' });
      if (response.ok) {
        toast.success('Database initialized successfully');
        setDbInitialized(true);
        fetchEmployees();
      } else {
        toast.error('Failed to initialize database');
      }
    } catch (error) {
      toast.error('Failed to initialize database');
      console.error(error);
    }
  };

  const seedDatabase = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      if (response.ok) {
        toast.success('20 employees seeded successfully');
        fetchEmployees();
      } else {
        toast.error('Failed to seed employees');
      }
    } catch (error) {
      toast.error('Failed to seed employees');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    let filtered = employees;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.position.toLowerCase().includes(query)
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(e => e.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
  }, [searchQuery, departmentFilter, employees]);

  const handleAdd = () => {
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } else {
        toast.error('Failed to delete employee');
      }
    } catch (error) {
      toast.error('Failed to delete employee');
      console.error(error);
    }
  };

  const handleSave = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      if (editingEmployee) {
        const response = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        });
        if (response.ok) {
          toast.success('Employee updated successfully');
          fetchEmployees();
        } else {
          toast.error('Failed to update employee');
        }
      } else {
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        });
        if (response.ok) {
          toast.success('Employee added successfully');
          fetchEmployees();
        } else {
          toast.error('Failed to add employee');
        }
      }
    } catch (error) {
      toast.error('Failed to save employee');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />

      {/* Industrial Header */}
      <header className="bg-sidebar text-sidebar-foreground border-b-4 border-primary">
        <div className="container mx-auto px-6">
          {/* Top bar with logo and actions */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {/* Industrial Logo */}
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded">
                  <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">APEX MANUFACTURING</h1>
                  <p className="text-xs text-sidebar-foreground/70 tracking-widest uppercase">Employee Directory</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!dbInitialized && (
                <Button variant="outline" onClick={initializeDatabase} className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
                  Initialize Database
                </Button>
              )}
              {employees.length === 0 && dbInitialized && (
                <Button variant="outline" onClick={seedDatabase} className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
                  Load Sample Data
                </Button>
              )}
              <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Employee
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-muted border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold text-foreground">{employees.length}</span>
                <span className="text-muted-foreground">Total Employees</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{departments.length}</span>
                <span className="text-muted-foreground">Departments</span>
              </div>
            </div>

            {/* Department badges */}
            <div className="flex items-center gap-2">
              {departments.slice(0, 5).map(dept => (
                <Badge
                  key={dept}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setDepartmentFilter(dept === departmentFilter ? 'all' : dept)}
                >
                  {dept}
                </Badge>
              ))}
              {departments.length > 5 && (
                <Badge variant="outline" className="text-xs">+{departments.length - 5}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search by name, email, or position..."
              className="pl-10 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-card">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {(searchQuery || departmentFilter !== 'all') && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {employees.length} employees
            {departmentFilter !== 'all' && (
              <Button
                variant="link"
                className="text-primary p-0 h-auto ml-2"
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Employee Cards Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading employees...
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border-2 border-dashed">
            <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No employees found</h3>
            <p className="mt-2 text-muted-foreground">
              {employees.length === 0
                ? "Get started by adding your first employee to the directory."
                : "Try adjusting your search or filter criteria."}
            </p>
            {employees.length === 0 && (
              <Button onClick={handleAdd} className="mt-4">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Employee
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Apex Manufacturing Co. - Employee Management System</p>
            <p>Built for industrial workforce management</p>
          </div>
        </div>
      </footer>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />
    </div>
  );
}
