'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  photo_url: string;
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

const departmentColors: Record<string, string> = {
  'Engineering': 'bg-blue-600',
  'Design': 'bg-pink-600',
  'Marketing': 'bg-green-600',
  'Sales': 'bg-orange-600',
  'HR': 'bg-purple-600',
  'Finance': 'bg-cyan-600',
  'Operations': 'bg-amber-700',
};

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  const deptColor = departmentColors[employee.department] || 'bg-slate-600';
  const initials = employee.name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${deptColor}`} />

      <CardContent className="p-0">
        {/* Header with photo and name */}
        <div className="p-5 pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border shadow-md">
              <AvatarImage src={employee.photo_url} alt={employee.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {employee.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {employee.position}
              </p>
              <Badge
                variant="secondary"
                className={`mt-2 ${deptColor} text-white border-0 font-medium`}
              >
                {employee.department}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact info */}
        <div className="px-5 py-4 space-y-3 bg-muted/30">
          <div className="flex items-center gap-3 text-sm">
            <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href={`mailto:${employee.email}`} className="text-foreground hover:text-primary truncate transition-colors">
              {employee.email}
            </a>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-foreground">{employee.phone || 'No phone'}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="px-5 py-3 flex gap-2 justify-end bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(employee)}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(employee.id)}
            className="hover:bg-destructive/10 text-destructive hover:text-destructive"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
