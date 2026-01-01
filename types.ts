
export interface Course {
  id: number;
  name: string;
  type: 'internal' | 'external'; // Added to distinguish internal courses
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
  completedCoursesList: { id: number; name: string; date: string; score: number }[]; // Added detailed history
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

export type Language = 'fa' | 'en';
export type ThemeColor = 'blue' | 'emerald' | 'violet' | 'rose' | 'amber';
export type ImageSize = '1K' | '2K' | '4K';
export type UserRole = 'admin' | 'training_manager';

export interface SystemSettings {
  companyName: string;
  ceoName: string;
  trainingManagerName: string;
  logo: string | null;
}

export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

export interface SeasonalData {
  [year: string]: {
    pattern: string[]; // Column headers extracted from the first upload
    seasons: {
      [key in Season]?: any[]; // Array of row objects
    }
  }
}

export type ContentFormat = 'video' | 'pamphlet' | 'powerpoint';

export interface ContentGenerationRequest {
  topic: string;
  description: string;
  targetAudience: string;
  format: ContentFormat;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}