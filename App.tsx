
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
  ChevronLeft, Search, Bell, Menu, X, Plus, Filter,
  Bot, User, Sparkles, Mic, MicOff, StopCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Tab, Course, Employee, Message 
} from './types';
import { 
  COURSES, EMPLOYEES, MONTHLY_TRAINING_DATA, 
  DEPARTMENT_DATA, SKILLS_RADAR_DATA, PERFORMANCE_DATA 
} from './constants';
import { streamGeminiResponse, analyzeDashboardData, GeminiLiveSession } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAiLoading]);

  const handleSendToAI = async (message: string) => {
    const text = message.trim();
    if (!text) return;

    const newUserMessage: Message = { role: 'user', content: text };
    setAiMessages(prev => [...prev, newUserMessage]);
    setIsAiLoading(true);
    setUserInput('');

    try {
      // Add an empty assistant message to act as a buffer for streaming
      setAiMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      const stream = streamGeminiResponse(text, aiMessages);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        setAiMessages(prev => {
          const newHistory = [...prev];
          const lastMsgIndex = newHistory.length - 1;
          if (newHistory[lastMsgIndex].role === 'assistant') {
            newHistory[lastMsgIndex] = { ...newHistory[lastMsgIndex], content: fullContent };
          }
          return newHistory;
        });
      }
    } catch (error: any) {
      setAiMessages(prev => {
        const newHistory = [...prev];
        const lastMsgIndex = newHistory.length - 1;
        const errorMessage = error.message || "خطا در دریافت پاسخ.";
        if (newHistory[lastMsgIndex].role === 'assistant' && !newHistory[lastMsgIndex].content) {
          newHistory[lastMsgIndex].content = errorMessage;
        } else {
          newHistory.push({ role: 'assistant', content: errorMessage });
        }
        return newHistory;
      });
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

const DashboardView: React.FC = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const stats = {
        monthly: MONTHLY_TRAINING_DATA,
        departments: DEPARTMENT_DATA,
        skills: SKILLS_RADAR_DATA,
        performance: PERFORMANCE_DATA
      };
      const result = await analyzeDashboardData(stats);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("خطا در تحلیل داده‌ها");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">داشبورد پایش آموزش</h1>
          <p className="text-slate-500 mt-1">خلاصه‌ی وضعیت برنامه‌های آموزشی و توسعه مهارت کارکنان</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:bg-indigo-400"
          >
            {isAnalyzing ? (
              <>
                <Sparkles size={16} className="animate-spin" />
                در حال تحلیل هوشمند...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                تحلیل هوشمند داده‌ها
              </>
            )}
          </button>
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm">
            تغییر بازه زمانی
          </button>
        </div>
      </div>

      {analysis && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-2xl animate-in zoom-in-95 duration-500 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Bot size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-indigo-900 text-lg">تحلیل راهبردی هوش مصنوعی</h3>
              <button onClick={() => setAnalysis(null)} className="mr-auto text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="markdown-body text-sm text-slate-700 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

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
};

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

// Markdown component configuration
const markdownComponents = {
  p: ({children}: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({children}: any) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
  ol: ({children}: any) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
  li: ({children}: any) => <li className="text-slate-700">{children}</li>,
  h1: ({children}: any) => <h1 className="text-lg font-bold mb-3 mt-4 text-slate-900 border-b pb-2">{children}</h1>,
  h2: ({children}: any) => <h2 className="text-md font-bold mb-2 mt-3 text-slate-800">{children}</h2>,
  h3: ({children}: any) => <h3 className="text-sm font-bold mb-2 mt-2 text-slate-800">{children}</h3>,
  code: ({inline, children}: any) => inline 
    ? <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 border border-slate-200">{children}</code> 
    : <div className="bg-slate-900 text-slate-100 p-4 rounded-xl my-3 overflow-x-auto shadow-inner" dir="ltr"><code className="font-mono text-xs">{children}</code></div>,
  pre: ({children}: any) => <>{children}</>,
  table: ({children}: any) => <div className="overflow-x-auto my-3"><table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">{children}</table></div>,
  thead: ({children}: any) => <thead className="bg-slate-50">{children}</thead>,
  th: ({children}: any) => <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{children}</th>,
  td: ({children}: any) => <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 border-t border-slate-100">{children}</td>,
  blockquote: ({children}: any) => <blockquote className="border-r-4 border-blue-500 pr-4 py-1 my-3 bg-blue-50/50 rounded-l-lg italic text-slate-600">{children}</blockquote>,
  strong: ({children}: any) => <strong className="font-bold text-slate-900">{children}</strong>,
  a: ({href, children}: any) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{children}</a>,
};

const AIView: React.FC<AIViewProps> = ({ messages, isLoading, onSend, userInput, setUserInput, messagesEndRef }) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const liveSessionRef = useRef<GeminiLiveSession | null>(null);

  useEffect(() => {
    if (isVoiceMode) {
      const startSession = async () => {
        liveSessionRef.current = new GeminiLiveSession();
        await liveSessionRef.current.start(() => setIsVoiceMode(false));
      };
      startSession();
    } else {
      liveSessionRef.current?.stop();
      liveSessionRef.current = null;
    }
    
    return () => {
      liveSessionRef.current?.stop();
    };
  }, [isVoiceMode]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-[calc(100vh-180px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${isVoiceMode ? 'bg-red-500 shadow-red-500/30' : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/30'}`}>
              {isVoiceMode ? <Mic size={24} className="text-white animate-pulse" /> : <Sparkles size={24} className="text-white" />}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">مشاور هوشمند آموزش</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1">
              {isVoiceMode ? 'Gemini Live • Voice Mode' : 'Powered by Gemini 3 Pro'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsVoiceMode(!isVoiceMode)}
             className={`p-2 transition rounded-xl flex items-center gap-2 px-3 text-sm font-bold ${
               isVoiceMode 
                 ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                 : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
             }`}
           >
             {isVoiceMode ? (
               <>
                 <StopCircle size={18} />
                 پایان مکالمه
               </>
             ) : (
               <>
                 <Mic size={18} />
                 گفتگوی صوتی
               </>
             )}
           </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition"><Settings size={20}/></button>
        </div>
      </div>

      {isVoiceMode ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 relative overflow-hidden">
           <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse"></div>
           </div>
           
           <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-slate-100 relative z-10">
                  <Mic size={48} className="text-red-500" />
                </div>
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-red-400 animate-ping opacity-20"></div>
                <div className="absolute -top-4 -left-4 w-[calc(100%+32px)] h-[calc(100%+32px)] rounded-full border border-red-200 animate-pulse"></div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">در حال گوش دادن...</h3>
                <p className="text-slate-500">می‌توانید به صورت طبیعی با هوش مصنوعی صحبت کنید.</p>
              </div>

              <div className="flex gap-2 justify-center">
                 <span className="w-1 h-8 bg-slate-300 rounded-full animate-[bounce_1s_infinite_100ms]"></span>
                 <span className="w-1 h-12 bg-slate-400 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                 <span className="w-1 h-6 bg-slate-300 rounded-full animate-[bounce_1s_infinite_300ms]"></span>
                 <span className="w-1 h-10 bg-slate-400 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                 <span className="w-1 h-6 bg-slate-300 rounded-full animate-[bounce_1s_infinite_500ms]"></span>
              </div>
           </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-blue-50 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                  <Bot size={48} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">چگونه می‌توانم به دانیال استیل کمک کنم؟</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 px-4">
                  من با تحلیل داده‌های آموزشی و استانداردهای صنعت فولاد، آماده پاسخگویی به سوالات شما هستم.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {[
                    'تدوین سرفصل دوره "ریخته‌گری مداوم"',
                    'تحلیل شاخص اثربخشی آموزش در سال ۱۴۰۳',
                    'پیشنهاد مسیر شغلی برای تکنسین‌های نت'
                  ].map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => onSend(q)}
                      className="text-right p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              const isLast = i === messages.length - 1;
              
              return (
                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    }`}>
                      {isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div className={`p-5 rounded-3xl shadow-sm text-sm ${
                      isUser 
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                      {isUser ? (
                        <p className="font-medium">{msg.content}</p>
                      ) : (
                        <div className="markdown-body">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {isLoading && isLast && (
                             <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse align-middle rounded-full"></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
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
        </>
      )}
    </div>
  );
};

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
