
import { Course, Employee, Language } from './types';

export const COURSES: Course[] = [
  { id: 1, name: 'ایمنی صنعتی در خط نورد (Industrial Safety)', participants: 45, completion: 78, status: 'active' },
  { id: 2, name: 'مدیریت کیفیت ISO 9001', participants: 32, completion: 92, status: 'active' },
  { id: 3, name: 'متالورژی فیزیکی فولاد (Physical Metallurgy)', participants: 28, completion: 65, status: 'active' },
  { id: 4, name: 'نگهداری و تعمیرات پیشگیرانه (PM)', participants: 38, completion: 100, status: 'completed' },
  { id: 5, name: 'کار با جرثقیل‌های سقفی', participants: 15, completion: 45, status: 'active' },
];

export const EMPLOYEES: Employee[] = [
  { id: 1, name: 'Ali Ahmadi', department: 'تولید نورد', coursesCompleted: 5, lastTraining: '1403/07/15' },
  { id: 2, name: 'Maryam Karimi', department: 'کنترل کیفی', coursesCompleted: 8, lastTraining: '1403/07/20' },
  { id: 3, name: 'Reza Mohammadi', department: 'فنی و مهندسی', coursesCompleted: 6, lastTraining: '1403/07/18' },
  { id: 4, name: 'Sara Saeedi', department: 'منابع انسانی', coursesCompleted: 3, lastTraining: '1403/08/01' },
];

export const MONTHLY_TRAINING_DATA = [
  { month: 'Apr', courses: 12, participants: 145 },
  { month: 'May', courses: 15, participants: 178 },
  { month: 'Jun', courses: 18, participants: 205 },
  { month: 'Jul', courses: 14, participants: 167 },
  { month: 'Aug', courses: 20, participants: 234 },
  { month: 'Sep', courses: 17, participants: 198 },
];

export const DEPARTMENT_DATA = [
  { name: 'Production', value: 35, color: '#3b82f6' },
  { name: 'Quality', value: 25, color: '#10b981' },
  { name: 'Technical', value: 20, color: '#f59e0b' },
  { name: 'Safety', value: 15, color: '#ef4444' },
  { name: 'HR/Other', value: 5, color: '#8b5cf6' },
];

export const SKILLS_RADAR_DATA = [
  { skill: 'Technical', current: 75, target: 90 },
  { skill: 'Safety', current: 85, target: 95 },
  { skill: 'Quality', current: 70, target: 85 },
  { skill: 'Management', current: 65, target: 80 },
  { skill: 'Soft Skills', current: 60, target: 75 },
];

export const PERFORMANCE_DATA = [
  { quarter: 'Q1', score: 72, budget: 85 },
  { quarter: 'Q2', score: 78, budget: 82 },
  { quarter: 'Q3', score: 85, budget: 88 },
  { quarter: 'Q4', score: 88, budget: 90 },
];

export const TRANSLATIONS = {
  fa: {
    app_name: 'استیل‌ترین پرو',
    dashboard: 'داشبورد مدیریتی',
    courses: 'مدیریت دوره‌ها',
    employees: 'سوابق کارکنان',
    reports: 'گزارشات و تحلیل',
    ai: 'مشاور هوشمند',
    settings: 'تنظیمات سیستم',
    search_placeholder: 'جستجو در سامانه...',
    role_admin: 'مدیریت کل',
    logout: 'خروج از سامانه',
    department: 'واحد توسعه سرمایه انسانی',
    company: 'شرکت دانیال استیل',
    
    // Dashboard
    dash_title: 'داشبورد پایش آموزش',
    dash_subtitle: 'خلاصه‌ی وضعیت برنامه‌های آموزشی و توسعه مهارت کارکنان',
    btn_time_range: 'تغییر بازه زمانی',
    btn_ai_analysis: 'تحلیل هوشمند داده‌ها',
    stat_active_courses: 'کل دوره‌های فعال',
    stat_trained_employees: 'کل کارکنان آموزش‌دیده',
    stat_progress: 'میانگین پیشرفت',
    stat_certificates: 'گواهینامه‌های صادرشده',
    chart_monthly: 'روند آموزش‌های ماهانه',
    chart_dist: 'توزیع واحدی آموزش‌ها',
    chart_skills: 'پروفایل مهارتی سازمان',
    chart_perf: 'مقایسه عملکرد و بودجه',
    
    // Courses
    course_manage_title: 'مدیریت دوره‌های آموزشی',
    course_manage_subtitle: 'لیست دوره‌های تخصصی، عمومی و ایمنی شرکت',
    btn_new_course: 'تعریف دوره جدید',
    filter_status: 'فیلتر وضعیت:',
    filter_all: 'همه دوره‌ها',
    filter_active: 'در حال برگزاری',
    filter_completed: 'تکمیل شده',
    col_course_name: 'نام و شناسه دوره',
    col_participants: 'تعداد فراگیران',
    col_progress: 'درصد پیشرفت محتوا',
    col_status: 'وضعیت',
    col_actions: 'مدیریت',
    view_details: 'مشاهده جزئیات',

    // AI
    ai_title: 'مشاور هوشمند آموزش',
    ai_subtitle: 'Powered by Gemini 3 Pro',
    ai_welcome_title: 'چگونه می‌توانم به دانیال استیل کمک کنم؟',
    ai_welcome_desc: 'من با تحلیل داده‌های آموزشی و استانداردهای صنعت فولاد، آماده پاسخگویی به سوالات شما هستم.',
    btn_voice_mode: 'گفتگوی صوتی',
    btn_stop_voice: 'پایان مکالمه',
    listening: 'در حال گوش دادن...',
    listening_desc: 'می‌توانید به صورت طبیعی با هوش مصنوعی صحبت کنید.',
    input_placeholder: 'سوال خود را اینجا بنویسید...',
    
    // Settings
    settings_title: 'تنظیمات سیستمی',
    settings_org_info: 'اطلاعات سازمان',
    settings_company_name: 'نام شرکت',
    settings_email: 'ایمیل سازمانی',
    settings_notifs: 'تنظیمات اعلان‌ها',
    settings_theme: 'شخصی‌سازی ظاهر',
    btn_save: 'ذخیره تغییرات',
    btn_cancel: 'انصراف',
    lang_select: 'زبان سیستم',
    theme_select: 'تم رنگی',
  },
  en: {
    app_name: 'SteelTrain Pro',
    dashboard: 'Dashboard',
    courses: 'Courses',
    employees: 'Employees',
    reports: 'Reports & Analytics',
    ai: 'AI Consultant',
    settings: 'Settings',
    search_placeholder: 'Search system...',
    role_admin: 'Super Admin',
    logout: 'Logout',
    department: 'Human Capital Development',
    company: 'Danial Steel Co.',

    // Dashboard
    dash_title: 'Training Dashboard',
    dash_subtitle: 'Summary of training programs and employee skill development',
    btn_time_range: 'Time Range',
    btn_ai_analysis: 'AI Smart Analysis',
    stat_active_courses: 'Active Courses',
    stat_trained_employees: 'Trained Employees',
    stat_progress: 'Avg. Progress',
    stat_certificates: 'Certificates Issued',
    chart_monthly: 'Monthly Training Trends',
    chart_dist: 'Department Distribution',
    chart_skills: 'Organizational Skills Profile',
    chart_perf: 'Performance vs Budget',

    // Courses
    course_manage_title: 'Course Management',
    course_manage_subtitle: 'List of specialized, general, and safety courses',
    btn_new_course: 'New Course',
    filter_status: 'Status Filter:',
    filter_all: 'All Courses',
    filter_active: 'Active',
    filter_completed: 'Completed',
    col_course_name: 'Course Name & ID',
    col_participants: 'Participants',
    col_progress: 'Content Progress',
    col_status: 'Status',
    col_actions: 'Actions',
    view_details: 'View Details',

    // AI
    ai_title: 'Smart Training Consultant',
    ai_subtitle: 'Powered by Gemini 3 Pro',
    ai_welcome_title: 'How can I help Danial Steel?',
    ai_welcome_desc: 'I am ready to answer your questions by analyzing training data and steel industry standards.',
    btn_voice_mode: 'Voice Mode',
    btn_stop_voice: 'End Session',
    listening: 'Listening...',
    listening_desc: 'You can speak naturally with the AI.',
    input_placeholder: 'Type your question here...',

    // Settings
    settings_title: 'System Settings',
    settings_org_info: 'Organization Info',
    settings_company_name: 'Company Name',
    settings_email: 'Company Email',
    settings_notifs: 'Notification Settings',
    settings_theme: 'Appearance',
    btn_save: 'Save Changes',
    btn_cancel: 'Cancel',
    lang_select: 'System Language',
    theme_select: 'Color Theme',
  }
};
