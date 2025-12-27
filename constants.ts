import { Course, Employee, Language } from './types';

export const APP_VERSION = '1.4.0';

export const COURSES: Course[] = [
  { id: 1, name: 'ایمنی صنعتی در خط نورد (Industrial Safety)', type: 'internal', participants: 45, completion: 78, status: 'active' },
  { id: 2, name: 'مدیریت کیفیت ISO 9001', type: 'external', participants: 32, completion: 92, status: 'active' },
  { id: 3, name: 'متالورژی فیزیکی فولاد (Physical Metallurgy)', type: 'internal', participants: 28, completion: 65, status: 'active' },
  { id: 4, name: 'نگهداری و تعمیرات پیشگیرانه (PM)', type: 'internal', participants: 38, completion: 100, status: 'completed' },
  { id: 5, name: 'کار با جرثقیل‌های سقفی', type: 'external', participants: 15, completion: 45, status: 'active' },
  { id: 6, name: 'اصول سرپرستی (Internal)', type: 'internal', participants: 20, completion: 10, status: 'active' },
];

export const EMPLOYEES: Employee[] = [
  { 
    id: 1, 
    name: 'علی احمدی', 
    department: 'تولید نورد', 
    coursesCompleted: 5, 
    lastTraining: '1403/07/15',
    completedCoursesList: [
      { id: 101, name: 'ایمنی عمومی', date: '1402/10/01', score: 95 },
      { id: 102, name: 'کار با دستگاه نورد', date: '1403/02/15', score: 88 }
    ]
  },
  { 
    id: 2, 
    name: 'مریم کریمی', 
    department: 'کنترل کیفی', 
    coursesCompleted: 8, 
    lastTraining: '1403/07/20',
    completedCoursesList: [
      { id: 201, name: 'کنترل کیفیت آماری', date: '1403/01/20', score: 98 },
      { id: 202, name: 'ISO 9001:2015', date: '1403/04/10', score: 92 },
      { id: 203, name: 'بازرسی جوش', date: '1403/06/05', score: 85 }
    ]
  },
  { 
    id: 3, 
    name: 'رضا محمدی', 
    department: 'فنی و مهندسی', 
    coursesCompleted: 6, 
    lastTraining: '1403/07/18',
    completedCoursesList: [
      { id: 301, name: 'PLC Programming', date: '1402/11/12', score: 90 }
    ]
  },
  { 
    id: 4, 
    name: 'سارا سعیدی', 
    department: 'منابع انسانی', 
    coursesCompleted: 3, 
    lastTraining: '1403/08/01',
    completedCoursesList: [
      { id: 401, name: 'قوانین کار و تامین اجتماعی', date: '1403/03/01', score: 100 }
    ]
  },
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

export const TRANSLATIONS = {
  fa: {
    app_name: 'سامانه آموزش استیل پرو',
    dashboard: 'داشبورد مدیریتی',
    courses: 'مدیریت دوره‌ها',
    employees: 'سوابق کارکنان',
    reports: 'گزارشات و تحلیل',
    ai: 'مشاور هوشمند',
    settings: 'تنظیمات سیستم',
    search_placeholder: 'جستجو در سامانه...',
    role_admin: 'مدیریت کل',
    role_training_manager: 'مسئول آموزش',
    switch_role: 'تغییر نقش کاربری',
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
    filter_type_label: 'نوع دوره:',
    filter_type_all: 'همه',
    filter_type_internal: 'داخلی',
    filter_type_external: 'خارجی',
    col_course_name: 'نام و شناسه دوره',
    col_participants: 'تعداد فراگیران',
    col_progress: 'درصد پیشرفت محتوا',
    col_status: 'وضعیت',
    col_actions: 'مدیریت',
    view_details: 'مشاهده جزئیات',

    // Employees
    emp_title: 'مدیریت سوابق کارکنان',
    emp_subtitle: 'مشاهده سوابق آموزشی، صدور گواهینامه و وضعیت دوره‌ها',
    emp_card_courses: 'دوره‌های تکمیل شده:',
    emp_details_title: 'جزئیات پرونده آموزشی',
    emp_history_title: 'تاریخچه دوره‌های گذرانده شده',
    emp_col_course: 'نام دوره',
    emp_col_date: 'تاریخ',
    emp_col_score: 'نمره',
    emp_col_cert: 'گواهینامه',
    btn_generate_cert: 'صدور مدرک هوشمند',
    btn_import_excel: 'بارگذاری اکسل پرسنل',
    cert_generating: 'در حال طراحی گواهینامه...',
    cert_modal_title: 'گواهینامه پایان دوره',
    cert_quality_label: 'کیفیت تصویر:',
    cert_select_api: 'انتخاب کلید API',
    
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
    settings_org_info: 'اطلاعات و مقامات سازمان',
    settings_company_name: 'نام شرکت',
    settings_ceo_name: 'نام مدیر عامل',
    settings_manager_name: 'نام مسئول آموزش',
    settings_email: 'ایمیل سازمانی',
    settings_notifs: 'تنظیمات اعلان‌ها',
    settings_theme: 'شخصی‌سازی ظاهر',
    settings_logo: 'لوگوی شرکت',
    settings_logo_desc: 'برای درج در گواهینامه‌ها (حداکثر 2MB)',
    btn_upload_logo: 'آپلود لوگو',
    btn_save: 'ذخیره تغییرات',
    btn_cancel: 'انصراف',
    lang_select: 'زبان سیستم',
    theme_select: 'تم رنگی',
  },
  en: {
    app_name: 'SteelPro LMS',
    dashboard: 'Dashboard',
    courses: 'Courses',
    employees: 'Employees',
    reports: 'Reports & Analytics',
    ai: 'AI Consultant',
    settings: 'Settings',
    search_placeholder: 'Search system...',
    role_admin: 'CEO / Admin',
    role_training_manager: 'Training Manager',
    switch_role: 'Switch Role',
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
    filter_type_label: 'Type:',
    filter_type_all: 'All',
    filter_type_internal: 'Internal',
    filter_type_external: 'External',
    col_course_name: 'Course Name & ID',
    col_participants: 'Participants',
    col_progress: 'Content Progress',
    col_status: 'Status',
    col_actions: 'Actions',
    view_details: 'View Details',

    // Employees
    emp_title: 'Employee Records',
    emp_subtitle: 'View training history, issue certificates, and course status',
    emp_card_courses: 'Courses Completed:',
    emp_details_title: 'Training File Details',
    emp_history_title: 'Completed Courses History',
    emp_col_course: 'Course Name',
    emp_col_date: 'Date',
    emp_col_score: 'Score',
    emp_col_cert: 'Certificate',
    btn_generate_cert: 'Smart Certificate',
    btn_import_excel: 'Import Staff Excel',
    cert_generating: 'Designing Certificate...',
    cert_modal_title: 'Completion Certificate',
    cert_quality_label: 'Image Quality:',
    cert_select_api: 'Select API Key',

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
    settings_org_info: 'Organization & Officials',
    settings_company_name: 'Company Name',
    settings_ceo_name: 'CEO Name',
    settings_manager_name: 'Training Manager Name',
    settings_email: 'Company Email',
    settings_notifs: 'Notification Settings',
    settings_theme: 'Appearance',
    settings_logo: 'Company Logo',
    settings_logo_desc: 'For certificates (Max 2MB)',
    btn_upload_logo: 'Upload Logo',
    btn_save: 'Save Changes',
    btn_cancel: 'Cancel',
    lang_select: 'System Language',
    theme_select: 'Color Theme',
  }
};