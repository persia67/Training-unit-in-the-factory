
import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Users, BookOpen, Award, TrendingUp, Download, 
  Upload, MessageSquare, FileText, Settings, 
  ChevronLeft, Search, Bell, Menu, X, Plus, Filter
} from 'lucide-react';
import { 
  Tab, Course, Employee, Message 
} from './types';
import { 
  COURSES, EMPLOYEES, MONTHLY_TRAINING_DATA, 
  DEPARTMENT_DATA, SKILLS_RADAR_DATA, PERFORMANCE_DATA 
} from './constants';
import { getGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSendToAI = async (message: string) => {
    const text = message.trim();
    if (!text) return;

    const newUserMessage: Message = { role: 'user', content: text };
    setAiMessages(prev => [...prev, newUserMessage]);
    setIsAiLoading(true);
    setUserInput('');

    try {
      const response = await getGeminiResponse(text, aiMessages);
      setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: error.message }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const tabsConfig = [
    { id: Tab.Dashboard, label: 'داشبورد مدیریتی', icon: TrendingUp },
    { id: Tab.Courses, label: 'مدیریت دوره‌ها', icon: BookOpen },
    { id: Tab.Employees, label: 'سوابق کارکنان', icon: Users },
    { id: Tab.Reports, label: 'گزارشات و تحلیل', icon: FileText },
    { id: Tab.AI, label: 'مشاور هوشمند', icon: MessageSquare },
    { id: Tab.Settings, label: 'تنظیمات سیستم', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white w-64 fixed h-full z-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} lg:static`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SteelTrain</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {tabsConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 right-6 left-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate">مدیریت کل</p>
                <p className="text-[10px] text-slate-500 truncate">admin@danialsteel.com</p>
              </div>
            </div>
            <button className="w-full text-xs text-red-400 font-medium hover:text-red-300 transition">
              خروج از سامانه
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500">
              <Menu size={24} />
            </button>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="جستجو در سامانه..." 
                className="bg-slate-100 border-none rounded-full pr-10 pl-4 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-blue-600 transition p-2 bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900">شرکت دانیال استیل</p>
                <p className="text-[10px] text-slate-500">واحد توسعه سرمایه انسانی</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === Tab.Dashboard && <DashboardView />}
            {activeTab === Tab.Courses && <CoursesView />}
            {activeTab === Tab.Employees && <EmployeesView />}
            {activeTab === Tab.Reports && <ReportsView />}
            {activeTab === Tab.AI && (
              <AIView 
                messages={aiMessages} 
                isLoading={isAiLoading} 
                onSend={handleSendToAI} 
                userInput={userInput}
                setUserInput={setUserInput}
                messagesEndRef={messagesEndRef}
              />
            )}
            {activeTab === Tab.Settings && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
};

/* --- Sub-Views --- */

const DashboardView: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">داشبورد پایش آموزش</h1>
        <p className="text-slate-500 mt-1">خلاصه‌ی وضعیت برنامه‌های آموزشی و توسعه مهارت کارکنان</p>
      </div>
      <div className="flex gap-2">
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm">
          تغییر بازه زمانی
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
          تولید گزارش ماهانه
        </button>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'کل دوره‌های فعال', val: '۲۴', trend: '+۳ این ماه', icon: BookOpen, color: 'blue' },
        { label: 'کل کارکنان آموزش‌دیده', val: '۱۴۳', trend: '+۱۲ نفر', icon: Users, color: 'emerald' },
        { label: 'میانگین پیشرفت', val: '۸۱٪', trend: '+۵.۲٪ رشد', icon: TrendingUp, color: 'orange' },
        { label: 'گواهینامه‌های صادرشده', val: '۸۷', trend: '۱۵ مورد انتظار', icon: Award, color: 'purple' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition">
          <div>
            <p className="text-slate-500 text-xs font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.val}</h3>
            <p className={`text-[10px] mt-2 font-medium ${stat.trend.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
              {stat.trend}
            </p>
          </div>
          <div className={`p-4 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition duration-300`}>
            <stat.icon size={24} />
          </div>
        </div>
      ))}
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={20} />
          روند آموزش‌های ماهانه
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_TRAINING_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="courses" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} name="تعداد دوره" />
              <Line type="monotone" dataKey="participants" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} name="نفر-ساعت" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">توزیع واحدی آموزش‌ها</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DEPARTMENT_DATA}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {DEPARTMENT_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">پروفایل مهارتی سازمان</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILLS_RADAR_DATA}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="skill" tick={{fontSize: 12, fill: '#64748b'}} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
              <Radar name="وضعیت فعلی" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Radar name="هدف سالانه" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">مقایسه عملکرد و بودجه</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PERFORMANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="quarter" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Legend />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="شاخص اثربخشی" />
              <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="تخصیص بودجه" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const CoursesView: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredCourses = COURSES.filter(course => {
    if (statusFilter === 'all') return true;
    return course.status === statusFilter;
  });

  const filterOptions = [
    { id: 'all', label: 'همه دوره‌ها', count: COURSES.length },
    { id: 'active', label: 'در حال برگزاری', count: COURSES.filter(c => c.status === 'active').length },
    { id: 'completed', label: 'تکمیل شده', count: COURSES.filter(c => c.status === 'completed').length },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">مدیریت دوره‌های آموزشی</h2>
            <p className="text-slate-500 text-sm mt-1">لیست دوره‌های تخصصی، عمومی و ایمنی شرکت</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 font-medium whitespace-nowrap">
            <Plus size={18} />
            تعریف دوره جدید
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 ml-2">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">فیلتر وضعیت:</span>
          </div>
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setStatusFilter(option.id as any)}
                className={`relative px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  statusFilter === option.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  statusFilter === option.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {filteredCourses.length > 0 ? (
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">نام و شناسه دوره</th>
                <th className="px-8 py-5">تعداد فراگیران</th>
                <th className="px-8 py-5">درصد پیشرفت محتوا</th>
                <th className="px-8 py-5">وضعیت</th>
                <th className="px-8 py-5">مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-slate-50/80 transition group animate-in fade-in slide-in-from-right-2 duration-300">
                  <td className="px-8 py-5">
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">{course.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">ID: ST-{200 + course.id}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-medium">{course.participants} نفر</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 max-w-[200px]">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${course.completion === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 min-w-[32px]">{course.completion}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${
                      course.status === 'active' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'active' ? 'bg-blue-600 animate-pulse' : 'bg-emerald-600'}`}></span>
                      {course.status === 'active' ? 'در حال برگزاری' : 'تکمیل شده'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button className="text-slate-400 hover:text-blue-600 transition flex items-center gap-1 text-xs font-bold">
                      مشاهده جزئیات
                      <ChevronLeft size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Filter size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">هیچ دوره‌ای با این وضعیت یافت نشد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeesView: React.FC = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
      <h2 className="text-xl font-bold text-slate-900">بانک اطلاعاتی کارکنان</h2>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
          <Upload size={18} />
          درون‌ریزی از اکسل
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <tr>
            <th className="px-8 py-5">مشخصات فردی</th>
            <th className="px-8 py-5">واحد سازمانی</th>
            <th className="px-8 py-5">دوره‌های گذرانده</th>
            <th className="px-8 py-5">آخرین فعالیت</th>
            <th className="px-8 py-5">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {EMPLOYEES.map(employee => (
            <tr key={employee.id} className="hover:bg-slate-50/80 transition">
              <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 uppercase">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{employee.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">کد پرسنلی: {1000 + employee.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-sm text-slate-600 font-medium">{employee.department}</td>
              <td className="px-8 py-5">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-blue-500" />
                  <span className="text-sm font-bold text-slate-900">{employee.coursesCompleted}</span>
                  <span className="text-xs text-slate-400">گواهینامه</span>
                </div>
              </td>
              <td className="px-8 py-5 text-sm text-slate-500 font-medium tabular-nums">{employee.lastTraining}</td>
              <td className="px-8 py-5">
                <button className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition">
                  <FileText size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ReportsView: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <Download size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">خروجی‌های استاندارد</h3>
      </div>
      <div className="space-y-4">
        {[
          { title: 'گزارش اثربخشی سالانه (Kirkpatrick)', color: 'blue' },
          { title: 'لیست ریز نمرات و حضور و غیاب نورد', color: 'emerald' },
          { title: 'تحلیل شکاف مهارتی واحد فنی', color: 'orange' },
          { title: 'صورت‌هزینه آموزش و بازگشت سرمایه (ROI)', color: 'purple' },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl transition group">
            <span className="text-slate-700 font-medium text-sm">{item.title}</span>
            <ChevronLeft className="text-slate-300 group-hover:text-blue-600 transition" size={18} />
          </button>
        ))}
      </div>
    </div>

    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Plus size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">گزارش‌ساز سفارشی</h3>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">فیلتر واحد سازمانی</label>
          <select className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option>همه واحدها</option>
            <option>تولید نورد</option>
            <option>کنترل کیفی</option>
            <option>فنی و تعمیرات</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">بازه زمانی گزارش</label>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="bg-slate-50 border-none rounded-xl p-4 text-sm outline-none" />
            <input type="date" className="bg-slate-50 border-none rounded-xl p-4 text-sm outline-none" />
          </div>
        </div>
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-900/10">
          ایجاد و پیش‌نمایش گزارش
        </button>
      </div>
    </div>
  </div>
);

interface AIViewProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (msg: string) => void;
  userInput: string;
  setUserInput: (s: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const AIView: React.FC<AIViewProps> = ({ messages, isLoading, onSend, userInput, setUserInput, messagesEndRef }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-[calc(100vh-180px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <MessageSquare size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">مشاور هوشمند آموزش</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Online & Expert</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="p-2 text-slate-400 hover:text-slate-600 transition"><Settings size={20}/></button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
            <MessageSquare size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">چگونه می‌توانم به دانیال استیل کمک کنم؟</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            من متخصص آموزش در صنعت فولاد هستم. می‌توانید درباره طراحی دوره‌ها، تحلیل نیازها یا محتوا از من بپرسید.
          </p>
          <div className="grid grid-cols-1 gap-2 w-full">
            {[
              'سرفصل آموزشی اپراتور کوره قوس الکتریکی را طراحی کن.',
              'چطور مهارت‌های نرم سرپرستان خط تولید را افزایش دهیم؟',
              'یک برنامه ایمنی برای واحد انبار محصولات فولادی بنویس.'
            ].map((q, i) => (
              <button 
                key={i}
                onClick={() => onSend(q)}
                className="text-right p-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm leading-relaxed whitespace-pre-wrap ${
            msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium'
          }`}>
            <p className="text-sm">{msg.content}</p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-end">
          <div className="bg-white border border-slate-200 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    <div className="p-6 bg-white border-t border-slate-100">
      <div className="flex gap-4 items-center bg-slate-50 p-2 pr-6 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition shadow-inner">
        <input 
          type="text" 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend(userInput)}
          placeholder="سوال خود را اینجا بنویسید..." 
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2"
        />
        <button 
          onClick={() => onSend(userInput)}
          disabled={isLoading || !userInput.trim()}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/40 disabled:bg-slate-300 disabled:shadow-none"
        >
          <ChevronLeft className="rotate-180" size={20} />
        </button>
      </div>
    </div>
  </div>
);

const SettingsView: React.FC = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 max-w-3xl animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-slate-900 mb-8">تنظیمات سیستمی</h2>
    
    <div className="space-y-10">
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">اطلاعات سازمان</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">نام شرکت</label>
            <input type="text" defaultValue="شرکت دانیال استیل" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">ایمیل سازمانی</label>
            <input type="email" defaultValue="hr@danialsteel.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">تنظیمات اعلان‌ها</h3>
        <div className="space-y-4">
          {[
            { label: 'اعلان شروع دوره‌های جدید به کارکنان', default: true },
            { label: 'یادآوری اتمام مهلت آزمون‌ها', default: true },
            { label: 'گزارش هفتگی مدیریت به ایمیل مدیرعامل', default: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition group">
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition">{item.label}</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="flex gap-4 pt-4">
        <button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-500/20">
          ذخیره تغییرات پیکربندی
        </button>
        <button className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition">
          انصراف
        </button>
      </div>
    </div>
  </div>
);

export default App;
