import { Course, Employee, Language } from './types';

export const APP_VERSION = '1.7.0';

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

export const DEPARTMENTS_LIST = [
  'تولید نورد',
  'تولید ذوب',
  'کنترل کیفی',
  'فنی و مهندسی',
  'تعمیرات و نگهداری',
  'اداری و منابع انسانی',
  'بازرگانی',
  'HSE (ایمنی)',
  'انبار'
];

export const ORGANIZATIONAL_UNITS = [
  'مدیران',
  'مسئولان',
  'سرپرستان',
  'پرسنل مالی',
  'پرسنل اداری',
  'پرسنل بازرگانی',
  'پرسنل برنامه ریزی تولید',
  'پرسنل تضمین کیفیت',
  'پرسنل R&D',
  'پرسنل آزمایشگاه',
  'پرسنل کالیبراسیون',
  'پرسنل PM',
  'پرسنل آموزش',
  'پرسنل HSE',
  'پرسنل انتظامات',
  'پرسنل خدمات',
  'پرسنل بازرسی',
  'پرسنل انبار محصول',
  'پرسنل انبار قطعات',
  'پرسنل دفتر فنی',
  'پرسنل برق و الکترونیک',
  'پرسنل هیدرولیک',
  'پرسنل کارگاه غلتک',
  'پرسنل باسکول و فروش',
  'پرسنل ماشین سازی',
  'پرسنل جوشکاری',
  'پرسنل تولید گالوانیزه (برش، بسته بندی، تولید)',
  'پرسنل تاسیسات',
  'پرسنل لیفتراک',
  'پرسنل تعمیرات (جرثقیل سقفی، خطوط، نقاشی)',
  'پرسنل اتوماتیک',
  'پرسنل کنترل کیفیت',
  'پرسنل تولید نورد سرد و اسید شویی'
];

export const TRANSLATIONS = {
  fa: {
    app_name: 'سامانه آموزش پرو',
    dashboard: 'داشبورد مدیریتی',
    courses: 'مدیریت دوره‌ها',
    employees: 'سوابق کارکنان',
    reports: 'گزارشات و تحلیل',
    ai: 'مشاور هوشمند',
    settings: 'تنظیمات سیستم',
    search_placeholder: 'جستجو در سامانه...',
    role_developer: 'توسعه‌دهنده (Developer)',
    role_factory_manager: 'مدیر کارخانه',
    role_training_manager: 'مسئول آموزش',
    switch_role: 'سطح دسترسی',
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
    btn_edit_course: 'ویرایش دوره',
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
    save_changes: 'ذخیره تغییرات',
    field_progress: 'درصد تکمیل دوره',

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
    btn_import_excel: 'بارگذاری لیست پرسنل',
    btn_import_history: 'بارگذاری سوابق آموزشی',
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
    ai_mode_chat: 'گفتگوی هوشمند',
    ai_mode_studio: 'استودیو محتوا',
    studio_title: 'تولید محتوای آموزشی',
    studio_desc: 'ساخت فیلم، جزوه و اسلاید آموزشی با هوش مصنوعی',
    field_topic: 'موضوع آموزش',
    field_description: 'شرح مختصر و نکات کلیدی',
    field_audience: 'مخاطبین هدف',
    field_format: 'فرمت خروجی',
    format_video: 'فیلم آموزشی (Video)',
    format_pamphlet: 'جزوه آموزشی (Pamphlet)',
    format_ppt: 'پاورپوینت (PowerPoint Outline)',
    btn_generate_content: 'تولید محتوا',
    generating_content: 'در حال تولید محتوا...',
    download_content: 'دانلود فایل',
    
    // Reports
    report_past_title: 'تعریف فرمت گزارش اولویت‌دار',
    report_past_desc: 'یک نمونه فایل اکسل با فرمت مورد نظر خود را بارگذاری کنید تا هوش مصنوعی طبق آن تحلیل کند',
    report_select_file: 'بارگذاری قالب (Template)',
    report_data_preview: 'پیش‌نمایش ساختار فایل اولویت‌دار',
    report_status_defined: 'ساختار گزارش اولویت‌دار شناسایی شد',
    btn_analyze_template: 'تحلیل انطباق با فرمت',
    
    // Seasonal Reports
    seasonal_title: 'آرشیو و تحلیل آمار فصلی',
    seasonal_subtitle: 'مدیریت داده‌های آماری فصول مختلف و تحلیل روند سالیانه',
    btn_add_year: 'افزودن سال مالی',
    season_spring: 'بهار',
    season_summer: 'تابستان',
    season_fall: 'پاییز',
    season_winter: 'زمستان',
    btn_upload_excel: 'بارگذاری فایل اکسل',
    btn_manual_entry: 'ورود دستی (طبق الگو)',
    btn_view_analysis: 'مشاهده تحلیل',
    no_data: 'داده‌ای موجود نیست',
    pattern_detected: 'الگوی آماری شناسایی شده است',
    data_analysis_title: 'تحلیل داده‌های آماری',
    charts_title: 'نمودارهای تحلیلی',
    data_table_title: 'جدول داده‌ها',
    save_data: 'ذخیره داده‌ها',
    enter_data_for: 'ورود داده برای',

    // Department Reports (General)
    dept_report_title: 'گزارش عملکرد دوره‌ها (جامع)',
    dept_report_subtitle: 'لیست کامل دوره‌های برگزار شده در فصل (تجمیع کل کارخانه)',
    lbl_select_dept: 'انتخاب واحد (Department)',
    lbl_row: 'ردیف',
    lbl_course_name: 'نام دوره',
    lbl_participants: 'تعداد نفرات',
    lbl_cost_per_person: 'هزینه دوره هر نفر (ریال)',
    lbl_duration: 'تعداد ساعت',
    lbl_location: 'محل برگزاری',
    lbl_total_cost: 'هزینه کل (ریال)',
    lbl_person_hours: 'نفر-ساعت',
    btn_add_row: 'افزودن سطر',
    btn_calculate_all: 'محاسبه تجمیعی',
    total_label: 'مجموع کل',
    chart_cost_dept: 'هزینه کل آموزش به تفکیک واحد (ریال)',
    chart_hours_dept: 'مجموع نفر-ساعت آموزشی به تفکیک واحد',
    chart_courses_quarterly: 'نمودار عملکرد دوره‌های فصل',
    btn_sync_from_units: 'تجمیع خودکار از واحدها',

    // Unit Reports (Detailed)
    unit_report_title: 'گزارش تفکیکی واحدها',
    unit_report_subtitle: 'ثبت و مشاهده عملکرد آموزشی به تفکیک هر واحد سازمانی',
    chart_unit_history: 'تاریخچه عملکرد واحد (۴ فصل)',
    lbl_select_unit: 'انتخاب واحد سازمانی',
    unit_stat_courses: 'تعداد دوره',
    unit_stat_participants: 'کل نفرات',
    unit_stat_hours: 'کل نفر-ساعت',

    // Consolidated Report
    consolidated_report_title: 'گزارش تجمیعی (چارت)',
    consolidated_report_subtitle: 'خلاصه عملکرد آموزشی به تفکیک چارت سازمانی و محاسبه هزینه‌ها',
    col_org_unit: 'چارت سازمانی',
    col_total_hours: 'تعداد ساعت',
    col_total_personnel: 'تعداد کل پرسنل',
    col_person_hours: 'نفر-ساعت',
    col_total_cost: 'هزینه کل (ریال)',
    chart_consolidated: 'نمودار تجمیعی عملکرد واحدها',
    metric_person_hours: 'نفر-ساعت',
    metric_personnel: 'تعداد پرسنل',
    metric_cost: 'هزینه',
    
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
  }
};