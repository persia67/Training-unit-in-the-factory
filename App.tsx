import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileBarChart, 
  Bot, 
  Settings, 
  Menu, 
  X, 
  Award, 
  Search, 
  Bell, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  TrendingUp,
  BrainCircuit,
  MoreVertical,
  CheckCircle
} from 'lucide-react';
import { 
  COURSES, 
  EMPLOYEES, 
  MONTHLY_TRAINING_DATA, 
  DEPARTMENT_DATA, 
  TRANSLATIONS 
} from './constants';
import { Tab, Language, ThemeColor, Message } from './types';
import { streamGeminiResponse, analyzeDashboardData, GeminiLiveSession } from './services/geminiService';

// Simple CSS Chart Components
const BarChart = ({ data }: { data: any[] }) => (
  <div className="flex items-end justify-between h-48 gap-2 pt-6">
    {data.map((d, i) => (
      <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
        <div className="relative w-full bg-slate-100 rounded-t-lg overflow-hidden h-full flex items-end">
          <div 
            className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-500 rounded-t-lg relative"
            style={{ height: `${(d.participants / 250) * 100}%` }}
          >
             <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
              {d.participants}
             </div>
          </div>
        </div>
        <span className="text-xs text-slate-500 font-medium rotate-0 truncate w-full text-center">{d.month}</span>
      </div>
    ))}
  </div>
);

const SimplePieChart = ({ data }: { data: any[] }) => (
  <div className="flex flex-col gap-3">
    {data.map((d, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
        <div className="flex-1 flex items-center justify-between text-sm">
          <span className="text-slate-600">{d.name}</span>
          <span className="font-medium text-slate-900">{d.value}%</span>
        </div>
        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }}></div>
        </div>
      </div>
    ))}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [lang, setLang] = useState<Language>('fa');
  const [theme, setTheme] = useState<ThemeColor>('blue');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // AI Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveSession = useRef<GeminiLiveSession | null>(null);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'fa';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const tabsConfig = [
    { id: Tab.Dashboard, label: t.dashboard, icon: LayoutDashboard },
    { id: Tab.Courses, label: t.courses, icon: BookOpen },
    { id: Tab.Employees, label: t.employees, icon: Users },
    { id: Tab.Reports, label: t.reports, icon: FileBarChart },
    { id: Tab.AI, label: t.ai, icon: Bot },
    { id: Tab.Settings, label: t.settings, icon: Settings },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      let fullResponse = '';
      const stream = streamGeminiResponse(userMsg.content, messages, lang);
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'fa' ? 'خطا در ارتباط با هوش مصنوعی.' : 'Error connecting to AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
      liveSession.current?.stop();
      liveSession.current = null;
      setIsVoiceMode(false);
    } else {
      setIsVoiceMode(true);
      liveSession.current = new GeminiLiveSession(lang);
      try {
        await liveSession.current.start(() => {
          setIsVoiceMode(false);
          liveSession.current = null;
        });
      } catch (error) {
        console.error('Failed to start live session', error);
        setIsVoiceMode(false);
      }
    }
  };

  const runDashboardAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeDashboardData({
        courses: COURSES,
        employees: EMPLOYEES,
        monthly: MONTHLY_TRAINING_DATA
      }, lang);
      setDashboardAnalysis(result);
    } catch (e) {
      console.error(e);
      setDashboardAnalysis(lang === 'fa' ? 'خطا در تحلیل.' : 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`flex h-screen bg-slate-50 text-slate-800 font-sans ${isRTL ? 'font-[Vazirmatn]' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white w-64 fixed h-full z-30 transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')} lg:static`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
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

        <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
          {tabsConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(false);
              }}
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

        <div className="p-6 shrink-0 mt-auto">
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-lg text-slate-800">
              {tabsConfig.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={t.search_placeholder} 
                className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2">
               <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="text-sm font-medium text-slate-600 hover:text-slate-900 uppercase">
                 {lang}
               </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Dashboard View */}
            {activeTab === Tab.Dashboard && (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t.dash_title}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t.dash_subtitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                      {t.btn_time_range}
                    </button>
                    <button 
                      onClick={runDashboardAnalysis}
                      disabled={isAnalyzing}
                      className={`px-4 py-2 bg-${theme}-600 text-white rounded-lg text-sm font-medium hover:bg-${theme}-700 flex items-center gap-2`}
                    >
                      {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                      {t.btn_ai_analysis}
                    </button>
                  </div>
                </div>

                {dashboardAnalysis && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4 text-indigo-700">
                      <Bot className="w-6 h-6" />
                      <h3 className="font-bold text-lg">AI Analysis Result</h3>
                    </div>
                    <div className="prose prose-sm max-w-none text-indigo-900 whitespace-pre-wrap">
                      {dashboardAnalysis}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t.stat_active_courses, value: '12', icon: BookOpen, color: 'blue' },
                    { label: t.stat_trained_employees, value: '1,245', icon: Users, color: 'emerald' },
                    { label: t.stat_progress, value: '87%', icon: TrendingUp, color: 'violet' },
                    { label: t.stat_certificates, value: '450', icon: Award, color: 'amber' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                          <stat.icon size={24} />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                      <p className="text-slate-500 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg text-slate-800">{t.chart_monthly}</h3>
                    </div>
                    <BarChart data={MONTHLY_TRAINING_DATA} />
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">{t.chart_dist}</h3>
                    <SimplePieChart data={DEPARTMENT_DATA} />
                  </div>
                </div>
              </>
            )}

            {/* Courses View */}
            {activeTab === Tab.Courses && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.course_manage_title}</h3>
                    <p className="text-sm text-slate-500">{t.course_manage_subtitle}</p>
                  </div>
                  <button className={`bg-${theme}-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-${theme}-700`}>
                    {t.btn_new_course}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="px-6 py-4">{t.col_course_name}</th>
                        <th className="px-6 py-4">{t.col_participants}</th>
                        <th className="px-6 py-4">{t.col_progress}</th>
                        <th className="px-6 py-4">{t.col_status}</th>
                        <th className="px-6 py-4 text-right">{t.col_actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {COURSES.map(course => (
                        <tr key={course.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-medium text-slate-900">{course.name}</td>
                          <td className="px-6 py-4 text-slate-600">{course.participants}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.completion}%` }}></div>
                              </div>
                              <span className="text-xs text-slate-500">{course.completion}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              course.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <CheckCircle size={12} />
                              {course.status === 'active' ? t.filter_active : t.filter_completed}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-blue-600">
                              <MoreVertical size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Employees View */}
            {activeTab === Tab.Employees && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                 <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-slate-900">Employee Management</h3>
                 <p className="text-slate-500 max-w-md mx-auto mt-2">
                   This module manages employee records, training history, and certification status. 
                 </p>
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left">
                    {EMPLOYEES.map(emp => (
                      <div key={emp.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition bg-slate-50/50">
                        <h4 className="font-bold text-slate-800">{emp.name}</h4>
                        <p className="text-xs text-slate-500">{emp.department}</p>
                        <div className="mt-2 text-sm">
                          Courses: <span className="font-medium">{emp.coursesCompleted}</span>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Reports View */}
            {activeTab === Tab.Reports && (
               <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <FileBarChart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Reports & Analytics</h3>
                <p className="text-slate-500">Comprehensive training reports would appear here.</p>
             </div>
            )}

            {/* AI View */}
            {activeTab === Tab.AI && (
              <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                       <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{t.ai_title}</h3>
                      <p className="text-xs text-slate-500">{t.ai_subtitle}</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleVoiceMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isVoiceMode 
                        ? 'bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isVoiceMode ? (
                      <>
                        <MicOff size={14} />
                        {t.btn_stop_voice}
                      </>
                    ) : (
                      <>
                        <Mic size={14} />
                        {t.btn_voice_mode}
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                  {messages.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{t.ai_welcome_title}</h2>
                      <p className="text-slate-500 max-w-md mx-auto">{t.ai_welcome_desc}</p>
                    </div>
                  )}
                  
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? `bg-${theme}-600 text-white rounded-br-none` 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                       <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef}></div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={isVoiceMode ? t.listening : t.input_placeholder}
                      disabled={isVoiceMode || isTyping}
                      className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isVoiceMode || isTyping}
                      className={`p-3 rounded-xl bg-${theme}-600 text-white hover:bg-${theme}-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  {isVoiceMode && (
                    <div className="mt-2 text-xs text-center text-red-500 animate-pulse font-medium">
                      {t.listening_desc}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Settings */}
             {activeTab === Tab.Settings && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                 <h3 className="text-lg font-bold text-slate-900 mb-4">{t.settings_title}</h3>
                 
                 <div className="grid gap-6 max-w-xl">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.lang_select}</label>
                     <div className="flex gap-2">
                       <button 
                        onClick={() => setLang('fa')} 
                        className={`px-4 py-2 rounded-lg border ${lang === 'fa' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200'}`}
                       >
                         فارسی
                       </button>
                       <button 
                        onClick={() => setLang('en')} 
                        className={`px-4 py-2 rounded-lg border ${lang === 'en' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200'}`}
                       >
                         English
                       </button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.theme_select}</label>
                     <div className="flex gap-2">
                       {['blue', 'emerald', 'violet', 'rose', 'amber'].map((c) => (
                         <button
                           key={c}
                           onClick={() => setTheme(c as ThemeColor)}
                           className={`w-8 h-8 rounded-full bg-${c}-500 ring-offset-2 ${theme === c ? 'ring-2 ring-slate-400' : ''}`}
                         />
                       ))}
                     </div>
                   </div>
                 </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
