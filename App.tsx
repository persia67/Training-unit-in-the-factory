
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
  Bot, User, Sparkles, Mic, MicOff, StopCircle, Lightbulb, Clock, CheckCircle, Globe, Palette
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Tab, Course, Employee, Message, Language, ThemeColor 
} from './types';
import { 
  COURSES, EMPLOYEES, MONTHLY_TRAINING_DATA, 
  DEPARTMENT_DATA, SKILLS_RADAR_DATA, PERFORMANCE_DATA, TRANSLATIONS 
} from './constants';
import { streamGeminiResponse, analyzeDashboardData, suggestTrainingCourses, GeminiLiveSession } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [lang, setLang] = useState<Language>('fa');
  const [theme, setTheme] = useState<ThemeColor>('blue');
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

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
      setAiMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      const stream = streamGeminiResponse(text, aiMessages, lang);
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
        const errorMessage = error.message || "Error";
        if (newHistory[lastMsgIndex].role === 'assistant' && !newHistory[lastMsgIndex].content) {
          newHistory[lastMsgIndex].content = errorMessage;
        }
        return newHistory;
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const tabsConfig = [
    { id: Tab.Dashboard, label: t.dashboard, icon: TrendingUp },
    { id: Tab.Courses, label: t.courses, icon: BookOpen },
    { id: Tab.Employees, label: t.employees, icon: Users },
    { id: Tab.Reports, label: t.reports, icon: FileText },
    { id: Tab.AI, label: t.ai, icon: MessageSquare },
    { id: Tab.Settings, label: t.settings, icon: Settings },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans ${lang === 'en' ? 'font-[sans-serif]' : ''}`}>
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white w-64 fixed h-full z-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : (lang === 'fa' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')} lg:static`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`bg-${theme}-600 p-2 rounded-lg`}>
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">{t.app_name}</span>
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
                  ? `bg-${theme}-600 text-white shadow-lg shadow-${theme}-900/20` 
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
              <div className={`w-8 h-8 rounded-full bg-${theme}-500 flex items-center justify-center text-xs font-bold`}>
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate">{t.role_admin}</p>
                <p className="text-[10px] text-slate-500 truncate">admin@danialsteel.com</p>
              </div>
            </div>
            <button className="w-full text-xs text-red-400 font-medium hover:text-red-300 transition">
              {t.logout}
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
              <Search className={`absolute ${lang === 'fa' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
              <input 
                type="text" 
                placeholder={t.search_placeholder} 
                className={`bg-slate-100 border-none rounded-full ${lang === 'fa' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm w-64 focus:ring-2 focus:ring-${theme}-500 outline-none transition`}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick Toggles */}
            <div className="hidden md:flex gap-2">
              <button 
                onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg text-xs font-bold w-10"
              >
                {lang === 'fa' ? 'EN' : 'فا'}
              </button>
              <div className="flex bg-slate-50 rounded-lg p-1">
                 {['blue', 'emerald', 'violet', 'rose', 'amber'].map((c) => (
                   <button 
                    key={c}
                    onClick={() => setTheme(c as ThemeColor)}
                    className={`w-4 h-4 rounded-full mx-0.5 ${theme === c ? 'ring-2 ring-offset-1 ring-slate-300' : ''}`}
                    style={{ backgroundColor: `var(--color-${c}-500, ${c === 'blue' ? '#3b82f6' : c === 'emerald' ? '#10b981' : c === 'violet' ? '#8b5cf6' : c === 'rose' ? '#f43f5e' : '#f59e0b'})`}} 
                   />
                 ))}
              </div>
            </div>

            <button className={`relative text-slate-500 hover:text-${theme}-600 transition p-2 bg-slate-100 rounded-full`}>
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className={`text-${lang === 'fa' ? 'left' : 'right'} hidden sm:block`}>
                <p className="text-xs font-bold text-slate-900">{t.company}</p>
                <p className="text-[10px] text-slate-500">{t.department}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === Tab.Dashboard && <DashboardView lang={lang} t={t} theme={theme} />}
            {activeTab === Tab.Courses && <CoursesView t={t} theme={theme} />}
            {activeTab === Tab.Employees && <EmployeesView t={t} theme={theme} />}
            {activeTab === Tab.Reports && <ReportsView t={t} theme={theme} />}
            {activeTab === Tab.AI && (
              <AIView 
                messages={aiMessages} 
                isLoading={isAiLoading} 
                onSend={handleSendToAI} 
                userInput={userInput}
                setUserInput={setUserInput}
                messagesEndRef={messagesEndRef}
                t={t}
                theme={theme}
                lang={lang}
              />
            )}
            {activeTab === Tab.Settings && (
              <SettingsView 
                t={t} 
                theme={theme} 
                lang={lang} 
                setLang={setLang} 
                setTheme={setTheme} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

/* --- Sub-Views --- */

const DashboardView: React.FC<{lang: Language, t: any, theme: ThemeColor}> = ({ lang, t, theme }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedCourses, setSuggestedCourses] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const stats = {
        monthly: MONTHLY_TRAINING_DATA,
        departments: DEPARTMENT_DATA,
        skills: SKILLS_RADAR_DATA,
        performance: PERFORMANCE_DATA
      };
      const result = await analyzeDashboardData(stats, lang);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestCourses = async () => {
    setIsSuggesting(true);
    try {
      const suggestions = await suggestTrainingCourses(SKILLS_RADAR_DATA, lang);
      setSuggestedCourses(suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.dash_title}</h1>
          <p className="text-slate-500 mt-1">{t.dash_subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`bg-${theme}-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-${theme}-700 transition shadow-lg shadow-${theme}-500/20 flex items-center gap-2 disabled:bg-${theme}-400`}
          >
            {isAnalyzing ? (
              <>
                <Sparkles size={16} className="animate-spin" />
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {t.btn_ai_analysis}
              </>
            )}
          </button>
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm">
            {t.btn_time_range}
          </button>
        </div>
      </div>

      {analysis && (
        <div className={`bg-gradient-to-br from-${theme}-50 to-white border border-${theme}-100 p-6 rounded-2xl animate-in zoom-in-95 duration-500 shadow-sm relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Bot size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-2 bg-${theme}-600 rounded-lg text-white shadow-md`}>
                <Sparkles size={20} />
              </div>
              <h3 className={`font-bold text-${theme}-900 text-lg`}>AI Strategy Analysis</h3>
              <button onClick={() => setAnalysis(null)} className={`mr-auto text-slate-400 hover:text-slate-600 ${lang === 'en' ? 'ml-auto mr-0' : 'mr-auto ml-0'}`}><X size={20}/></button>
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
          { label: t.stat_active_courses, val: '24', trend: '+3', icon: BookOpen, color: theme },
          { label: t.stat_trained_employees, val: '143', trend: '+12', icon: Users, color: 'emerald' },
          { label: t.stat_progress, val: '81%', trend: '+5.2%', icon: TrendingUp, color: 'orange' },
          { label: t.stat_certificates, val: '87', trend: '15', icon: Award, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-${theme}-200 transition`}>
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
            <TrendingUp className={`text-${theme}-600`} size={20} />
            {t.chart_monthly}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_TRAINING_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey="courses" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
                <Line type="monotone" dataKey="participants" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{t.chart_dist}</h3>
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
          <h3 className="text-lg font-bold text-slate-900 mb-6">{t.chart_skills}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILLS_RADAR_DATA}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{fontSize: 12, fill: '#64748b'}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{t.chart_perf}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Suggestions Section */}
      <div className="bg-slate-900 rounded-3xl shadow-lg shadow-slate-900/10 overflow-hidden text-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className={`p-2 bg-${theme}-500 rounded-lg text-white`}>
                   <Lightbulb size={24} />
                 </div>
                 <h2 className="text-2xl font-bold">AI Course Suggestions</h2>
              </div>
              <p className="text-slate-400 text-sm">Based on Skill Gap Analysis</p>
           </div>
           
           <button 
             onClick={handleSuggestCourses}
             disabled={isSuggesting}
             className={`bg-${theme}-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-${theme}-600 transition shadow-lg shadow-${theme}-500/20 flex items-center gap-2 disabled:bg-${theme}-700 disabled:opacity-70`}
           >
             {isSuggesting ? (
               <>
                 <Sparkles size={18} className="animate-spin" />
               </>
             ) : (
               <>
                 <Sparkles size={18} />
                 Generate New
               </>
             )}
           </button>
        </div>
        
        {suggestedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-6 duration-700">
            {suggestedCourses.map((course, idx) => (
              <div key={idx} className={`bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-${theme}-500/50 transition group relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${theme}-500/10 rounded-bl-full -mr-4 -mt-4 transition group-hover:bg-${theme}-500/20`}></div>
                
                <div className="flex justify-between items-start mb-4">
                   <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-slate-300 border border-slate-600">
                     {course.targetSkill}
                   </span>
                   {course.priority === 'High' && (
                     <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                       High Priority
                     </span>
                   )}
                </div>
                
                <h3 className={`text-lg font-bold text-white mb-2 group-hover:text-${theme}-400 transition`}>{course.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{course.description}</p>
                
                <div className="flex items-center justify-between border-t border-slate-700 pt-4 mt-auto">
                   <div className="flex items-center gap-2 text-slate-500 text-xs">
                     <Clock size={14} />
                     {course.duration}
                   </div>
                   <button className={`flex items-center gap-1 text-sm font-bold text-${theme}-500 hover:text-${theme}-400 transition`}>
                     Add
                     <Plus size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
             <Lightbulb size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
             <p className="text-slate-400">Click generate to receive AI recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CoursesView: React.FC<{t: any, theme: ThemeColor}> = ({ t, theme }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredCourses = COURSES.filter(course => {
    if (statusFilter === 'all') return true;
    return course.status === statusFilter;
  });

  const filterOptions = [
    { id: 'all', label: t.filter_all, count: COURSES.length },
    { id: 'active', label: t.filter_active, count: COURSES.filter(c => c.status === 'active').length },
    { id: 'completed', label: t.filter_completed, count: COURSES.filter(c => c.status === 'completed').length },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.course_manage_title}</h2>
            <p className="text-slate-500 text-sm mt-1">{t.course_manage_subtitle}</p>
          </div>
          <button className={`flex items-center gap-2 bg-${theme}-600 text-white px-6 py-2.5 rounded-xl hover:bg-${theme}-700 transition shadow-lg shadow-${theme}-500/20 font-medium whitespace-nowrap`}>
            <Plus size={18} />
            {t.btn_new_course}
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 ml-2">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.filter_status}</span>
          </div>
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setStatusFilter(option.id as any)}
                className={`relative px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  statusFilter === option.id 
                    ? `bg-white text-${theme}-600 shadow-sm` 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  statusFilter === option.id ? `bg-${theme}-50 text-${theme}-600` : 'bg-slate-200 text-slate-500'
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
                <th className="px-8 py-5">{t.col_course_name}</th>
                <th className="px-8 py-5">{t.col_participants}</th>
                <th className="px-8 py-5">{t.col_progress}</th>
                <th className="px-8 py-5">{t.col_status}</th>
                <th className="px-8 py-5">{t.col_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-slate-50/80 transition group animate-in fade-in slide-in-from-right-2 duration-300">
                  <td className="px-8 py-5">
                    <div>
                      <p className={`text-sm font-bold text-slate-900 group-hover:text-${theme}-600 transition`}>{course.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">ID: ST-{200 + course.id}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-medium">{course.participants}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 max-w-[200px]">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${course.completion === 100 ? 'bg-emerald-500' : `bg-${theme}-600`}`}
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 min-w-[32px]">{course.completion}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${
                      course.status === 'active' 
                        ? `bg-${theme}-50 text-${theme}-700` 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'active' ? `bg-${theme}-600 animate-pulse` : 'bg-emerald-600'}`}></span>
                      {course.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button className={`text-slate-400 hover:text-${theme}-600 transition flex items-center gap-1 text-xs font-bold`}>
                      {t.view_details}
                      <ChevronLeft size={14} className="rtl:rotate-0 ltr:rotate-180" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Filter size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No courses found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeesView: React.FC<{t: any, theme: ThemeColor}> = ({ t, theme }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
      <h2 className="text-xl font-bold text-slate-900">Employee Database</h2>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
          <Upload size={18} />
          Import
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-right ltr:text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <tr>
            <th className="px-8 py-5">Employee</th>
            <th className="px-8 py-5">Department</th>
            <th className="px-8 py-5">Completed</th>
            <th className="px-8 py-5">Last Activity</th>
            <th className="px-8 py-5">Actions</th>
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
                    <p className="text-[10px] text-slate-400 mt-1">ID: {1000 + employee.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-sm text-slate-600 font-medium">{employee.department}</td>
              <td className="px-8 py-5">
                <div className="flex items-center gap-2">
                  <Award size={14} className={`text-${theme}-500`} />
                  <span className="text-sm font-bold text-slate-900">{employee.coursesCompleted}</span>
                  <span className="text-xs text-slate-400">Cert.</span>
                </div>
              </td>
              <td className="px-8 py-5 text-sm text-slate-500 font-medium tabular-nums">{employee.lastTraining}</td>
              <td className="px-8 py-5">
                <button className={`bg-${theme}-50 text-${theme}-600 p-2 rounded-lg hover:bg-${theme}-600 hover:text-white transition`}>
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

const ReportsView: React.FC<{t: any, theme: ThemeColor}> = ({ t, theme }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 bg-${theme}-50 text-${theme}-600 rounded-2xl`}>
          <Download size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{t.reports} (Standard)</h3>
      </div>
      <div className="space-y-4">
        {[
          { title: 'Annual Effectiveness Report (Kirkpatrick)', color: 'blue' },
          { title: 'Detailed Attendance & Score List', color: 'emerald' },
          { title: 'Technical Skill Gap Analysis', color: 'orange' },
          { title: 'Training ROI Statement', color: 'purple' },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl transition group">
            <span className="text-slate-700 font-medium text-sm">{item.title}</span>
            <ChevronLeft className={`text-slate-300 group-hover:text-${theme}-600 transition rtl:rotate-0 ltr:rotate-180`} size={18} />
          </button>
        ))}
      </div>
    </div>

    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Plus size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Custom Report Builder</h3>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Department Filter</label>
          <select className={`w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-${theme}-500 outline-none`}>
            <option>All Departments</option>
            <option>Production</option>
            <option>Quality</option>
            <option>Technical</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Time Range</label>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="bg-slate-50 border-none rounded-xl p-4 text-sm outline-none" />
            <input type="date" className="bg-slate-50 border-none rounded-xl p-4 text-sm outline-none" />
          </div>
        </div>
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-900/10">
          Generate & Preview
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
  t: any;
  theme: ThemeColor;
  lang: Language;
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

const AIView: React.FC<AIViewProps> = ({ messages, isLoading, onSend, userInput, setUserInput, messagesEndRef, t, theme, lang }) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const liveSessionRef = useRef<GeminiLiveSession | null>(null);

  useEffect(() => {
    if (isVoiceMode) {
      const startSession = async () => {
        liveSessionRef.current = new GeminiLiveSession(lang);
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
  }, [isVoiceMode, lang]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-[calc(100vh-180px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${isVoiceMode ? 'bg-red-500 shadow-red-500/30' : `bg-gradient-to-br from-${theme}-600 to-${theme}-800 shadow-${theme}-500/30`}`}>
              {isVoiceMode ? <Mic size={24} className="text-white animate-pulse" /> : <Sparkles size={24} className="text-white" />}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{t.ai_title}</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1">
              {isVoiceMode ? 'Gemini Live • Voice Mode' : t.ai_subtitle}
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
                 {t.btn_stop_voice}
               </>
             ) : (
               <>
                 <Mic size={18} />
                 {t.btn_voice_mode}
               </>
             )}
           </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition"><Settings size={20}/></button>
        </div>
      </div>

      {isVoiceMode ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 relative overflow-hidden">
           <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className={`w-96 h-96 bg-${theme}-400 rounded-full filter blur-3xl animate-pulse`}></div>
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
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.listening}</h3>
                <p className="text-slate-500">{t.listening_desc}</p>
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
                <div className={`w-24 h-24 bg-white rounded-full shadow-lg border-4 border-${theme}-50 flex items-center justify-center mb-6 animate-in zoom-in duration-500`}>
                  <Bot size={48} className={`text-${theme}-600`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t.ai_welcome_title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 px-4">
                  {t.ai_welcome_desc}
                </p>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {(lang === 'fa' ? [
                    'تدوین سرفصل دوره "ریخته‌گری مداوم"',
                    'تحلیل شاخص اثربخشی آموزش در سال ۱۴۰۳',
                    'پیشنهاد مسیر شغلی برای تکنسین‌های نت'
                  ] : [
                    'Create syllabus for "Continuous Casting" course',
                    'Analyze training effectiveness for 2024',
                    'Suggest career path for maintenance technicians'
                  ]).map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => onSend(q)}
                      className={`text-${lang === 'fa' ? 'right' : 'left'} p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:border-${theme}-400 hover:bg-${theme}-50 hover:text-${theme}-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200`}
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
                      isUser ? 'bg-slate-200 text-slate-600' : `bg-${theme}-600 text-white shadow-lg shadow-${theme}-500/30`
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
                             <span className={`inline-block w-2 h-4 bg-${theme}-600 ml-1 animate-pulse align-middle rounded-full`}></span>
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
                   <div className={`w-8 h-8 rounded-full bg-${theme}-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-${theme}-500/30`}>
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <span className={`w-2 h-2 bg-${theme}-600 rounded-full animate-bounce`} style={{animationDelay: '0ms'}}></span>
                      <span className={`w-2 h-2 bg-${theme}-600 rounded-full animate-bounce`} style={{animationDelay: '150ms'}}></span>
                      <span className={`w-2 h-2 bg-${theme}-600 rounded-full animate-bounce`} style={{animationDelay: '300ms'}}></span>
                    </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <div className={`flex gap-4 items-center bg-slate-50 p-2 ${lang === 'fa' ? 'pr-6' : 'pl-6'} rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-${theme}-500 transition shadow-inner`}>
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSend(userInput)}
                placeholder={t.input_placeholder}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2"
              />
              <button 
                onClick={() => onSend(userInput)}
                disabled={isLoading || !userInput.trim()}
                className={`bg-${theme}-600 text-white p-3 rounded-xl hover:bg-${theme}-700 transition shadow-lg shadow-${theme}-500/40 disabled:bg-slate-300 disabled:shadow-none`}
              >
                <ChevronLeft className={`rtl:rotate-180 ltr:rotate-0`} size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SettingsView: React.FC<{t: any, theme: ThemeColor, lang: Language, setLang: (l: Language) => void, setTheme: (t: ThemeColor) => void}> = ({ t, theme, lang, setLang, setTheme }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 max-w-3xl animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-slate-900 mb-8">{t.settings_title}</h2>
    
    <div className="space-y-10">
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{t.settings_org_info}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">{t.settings_company_name}</label>
            <input type="text" defaultValue="Danial Steel Co." className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-${theme}-500 transition`} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">{t.settings_email}</label>
            <input type="email" defaultValue="hr@danialsteel.com" className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-${theme}-500 transition`} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{t.settings_theme}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-3">{t.lang_select}</label>
              <div className="flex gap-2">
                <button onClick={() => setLang('fa')} className={`flex-1 p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 ${lang === 'fa' ? `border-${theme}-500 bg-${theme}-50 text-${theme}-600` : 'border-slate-200 hover:bg-slate-50'}`}>
                   <span className="text-lg">🇮🇷</span> فارسی
                </button>
                <button onClick={() => setLang('en')} className={`flex-1 p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 ${lang === 'en' ? `border-${theme}-500 bg-${theme}-50 text-${theme}-600` : 'border-slate-200 hover:bg-slate-50'}`}>
                   <span className="text-lg">🇬🇧</span> English
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-3">{t.theme_select}</label>
              <div className="flex gap-3">
                 {['blue', 'emerald', 'violet', 'rose', 'amber'].map((c) => (
                   <button 
                    key={c}
                    onClick={() => setTheme(c as ThemeColor)}
                    className={`w-10 h-10 rounded-full ${theme === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'} transition-all`}
                    style={{ backgroundColor: `var(--color-${c}-500, ${c === 'blue' ? '#3b82f6' : c === 'emerald' ? '#10b981' : c === 'violet' ? '#8b5cf6' : c === 'rose' ? '#f43f5e' : '#f59e0b'})`}} 
                   />
                 ))}
              </div>
            </div>
        </div>
      </section>

      <div className="flex gap-4 pt-4">
        <button className={`flex-1 bg-${theme}-600 text-white py-4 rounded-2xl font-bold hover:bg-${theme}-700 transition shadow-xl shadow-${theme}-500/20`}>
          {t.btn_save}
        </button>
        <button className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition">
          {t.btn_cancel}
        </button>
      </div>
    </div>
  </div>
);

export default App;
