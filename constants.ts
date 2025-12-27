
import { Course, Employee } from './types';

export const COURSES: Course[] = [
  { id: 1, name: 'ایمنی صنعتی در خط نورد', participants: 45, completion: 78, status: 'active' },
  { id: 2, name: 'مدیریت کیفیت ISO 9001', participants: 32, completion: 92, status: 'active' },
  { id: 3, name: 'متالورژی فیزیکی فولاد', participants: 28, completion: 65, status: 'active' },
  { id: 4, name: 'نگهداری و تعمیرات پیشگیرانه', participants: 38, completion: 100, status: 'completed' },
  { id: 5, name: 'کار با جرثقیل‌های سقفی', participants: 15, completion: 45, status: 'active' },
];

export const EMPLOYEES: Employee[] = [
  { id: 1, name: 'علی احمدی', department: 'تولید نورد', coursesCompleted: 5, lastTraining: '1403/07/15' },
  { id: 2, name: 'مریم کریمی', department: 'کنترل کیفی', coursesCompleted: 8, lastTraining: '1403/07/20' },
  { id: 3, name: 'رضا محمدی', department: 'فنی و مهندسی', coursesCompleted: 6, lastTraining: '1403/07/18' },
  { id: 4, name: 'سارا سعیدی', department: 'منابع انسانی', coursesCompleted: 3, lastTraining: '1403/08/01' },
];

export const MONTHLY_TRAINING_DATA = [
  { month: 'فروردین', courses: 12, participants: 145 },
  { month: 'اردیبهشت', courses: 15, participants: 178 },
  { month: 'خرداد', courses: 18, participants: 205 },
  { month: 'تیر', courses: 14, participants: 167 },
  { month: 'مرداد', courses: 20, participants: 234 },
  { month: 'شهریور', courses: 17, participants: 198 },
];

export const DEPARTMENT_DATA = [
  { name: 'تولید', value: 35, color: '#3b82f6' },
  { name: 'کیفیت', value: 25, color: '#10b981' },
  { name: 'فنی', value: 20, color: '#f59e0b' },
  { name: 'ایمنی', value: 15, color: '#ef4444' },
  { name: 'سایر', value: 5, color: '#8b5cf6' },
];

export const SKILLS_RADAR_DATA = [
  { skill: 'فنی', current: 75, target: 90 },
  { skill: 'ایمنی', current: 85, target: 95 },
  { skill: 'کیفیت', current: 70, target: 85 },
  { skill: 'مدیریتی', current: 65, target: 80 },
  { skill: 'نرم‌افزاری', current: 60, target: 75 },
];

export const PERFORMANCE_DATA = [
  { quarter: 'Q1', score: 72, budget: 85 },
  { quarter: 'Q2', score: 78, budget: 82 },
  { quarter: 'Q3', score: 85, budget: 88 },
  { quarter: 'Q4', score: 88, budget: 90 },
];
