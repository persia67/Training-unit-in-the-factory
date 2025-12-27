
export interface Course {
  id: number;
  name: string;
  participants: number;
  completion: number;
  status: 'active' | 'completed';
}

export interface Employee {
  id: number;
  name: string;
  department: string;
  coursesCompleted: number;
  lastTraining: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export enum Tab {
  Dashboard = 'dashboard',
  Courses = 'courses',
  Employees = 'employees',
  Reports = 'reports',
  AI = 'ai',
  Settings = 'settings'
}
