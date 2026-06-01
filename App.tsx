import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
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
  CheckCircle, 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  Plus, 
  Trash, 
  Edit, 
  GraduationCap, 
  Building2, 
  Globe, 
  Upload, 
  Image as ImageIcon, 
  KeyRound, 
  FileSpreadsheet,
  UserCog,
  ShieldCheck,
  Save,
  Cloud, 
  CloudOff,
  Table as TableIcon,
  History,
  Sparkles, 
  Info,
  Archive,
  ChevronRight,
  ChevronDown,
  Video,
  FileType,
  Presentation,
  Clapperboard,
  MessageSquare,
  Wand2,
  HardHat,
  Code2,
  DollarSign,
  Clock,
  Briefcase,
  Layers,
  Activity,
  Target,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  COURSES, 
  EMPLOYEES, 
  MONTHLY_TRAINING_DATA, 
  DEPARTMENT_DATA, 
  TRANSLATIONS,
  APP_VERSION,
  DEPARTMENTS_LIST,
  ORGANIZATIONAL_UNITS
} from './constants';
import { Tab, Language, ThemeColor, Message, Employee, ImageSize, SystemSettings, UserRole, SeasonalData, Season, ContentGenerationRequest, ContentFormat, DepartmentalData, DepartmentReportRow, ConsolidatedReportData, ConsolidatedReportItem } from './types';
import { streamGeminiResponse, analyzeDashboardData, GeminiLiveSession, generateCertificate, generateTrainingVideo, generateTrainingDocument } from './services/geminiService';

// Persistence Helper with Error Handling
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Settings & Preferences (Sticky)
  const [lang, setLang] = useStickyState<Language>('fa', 'app_lang');
  const [theme, setTheme] = useStickyState<ThemeColor>('blue', 'app_theme');
  const [systemSettings, setSystemSettings] = useStickyState<SystemSettings>({
      companyName: 'Danial Steel Co.',
      ceoName: '',
      trainingManagerName: '',
      logo: null,
      apiKey: '' // Default empty
  }, 'app_settings');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('developer');
  
  // Data State with Persistence
  const [coursesList, setCoursesList] = useStickyState(COURSES, 'app_data_courses');
  const [employeesList, setEmployeesList] = useStickyState<Employee[]>(EMPLOYEES, 'app_data_employees');
  
  // Reporting State with Persistence
  const [selectedYear, setSelectedYear] = useStickyState<string>('1403', 'app_data_year');
  const [yearsList, setYearsList] = useStickyState<string[]>(['1403'], 'app_data_years_list');
  
  // Report 1: General
  const [generalCourseReports, setGeneralCourseReports] = useStickyState<DepartmentalData>({}, 'app_data_general_reports');
  // Report 3: Unit Specific
  const [unitReports, setUnitReports] = useStickyState<DepartmentalData>({}, 'app_data_unit_reports');
  // Report 2: Consolidated
  const [consolidatedReports, setConsolidatedReports] = useStickyState<ConsolidatedReportData>({}, 'app_data_consolidated_reports');

  const [activeReportSubTab, setActiveReportSubTab] = useState<'courses' | 'units' | 'consolidated'>('courses');
  const [selectedUnitName, setSelectedUnitName] = useState<string>(ORGANIZATIONAL_UNITS[0]);
  const [selectedDeptSeason, setSelectedDeptSeason] = useState<Season>('Spring');
  const [newRowData, setNewRowData] = useState<Partial<DepartmentReportRow>>({
    courseName: '', participants: 0, costPerPerson: 0, durationHours: 0, location: ''
  });
  const [consolidatedChartMetric, setConsolidatedChartMetric] = useState<'personHours' | 'totalCost' | 'totalPersonnel'>('totalPersonnel');

  // UI States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<{name: string, type: 'internal' | 'external', status: 'active' | 'completed', completion: number}>({
    name: '', type: 'internal', status: 'active', completion: 0
  });
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [selectedCourseType, setSelectedCourseType] = useState<'all' | 'internal' | 'external'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [generatedCertUrl, setGeneratedCertUrl] = useState<string | null>(null);
  const [certImageSize, setCertImageSize] = useState<ImageSize>('1K');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [aiMode, setAiMode] = useState<'chat' | 'studio'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [genForm, setGenForm] = useState<ContentGenerationRequest>({
    topic: '', description: '', targetAudience: '', format: 'pamphlet'
  });
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContentUrl, setGeneratedContentUrl] = useState<string | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveSession = useRef<GeminiLiveSession | null>(null);
  const isFirstRun = useRef(true);

  // Safe translation access
  const t = TRANSLATIONS[lang] || TRANSLATIONS['fa'];

  const tabsConfig = [
    { id: Tab.Dashboard, label: t.dashboard, icon: LayoutDashboard },
    { id: Tab.Courses, label: t.courses, icon: BookOpen },
    { id: Tab.Employees, label: t.employees, icon: Users },
    { id: Tab.Reports, label: t.reports, icon: FileBarChart },
    { id: Tab.AI, label: t.ai, icon: Bot },
    { id: Tab.Settings, label: t.settings, icon: Settings },
  ];

  const isRTL = lang === 'fa';
  const canEditContent = ['developer', 'training_manager'].includes(userRole);
  const canEditSettings = ['developer', 'factory_manager'].includes(userRole);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  // Network Status Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save Indicator Effect (Visual only, actual save happens in useStickyState)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setShowSaveIndicator(true);
    const timer = setTimeout(() => setShowSaveIndicator(false), 2000);
    return () => clearTimeout(timer);
  }, [coursesList, employeesList, generalCourseReports, unitReports, consolidatedReports, systemSettings]);

  // Logic functions...
  
  const openCourseModal = (course?: any) => {
    if (course) {
      setEditingCourseId(course.id);
      setCourseForm({
        name: course.name,
        type: course.type,
        status: course.status,
        completion: course.completion
      });
    } else {
      setEditingCourseId(null);
      setCourseForm({ name: '', type: 'internal', status: 'active', completion: 0 });
    }
    setIsCourseModalOpen(true);
    setOpenActionMenuId(null);
  };

  const handleSaveCourse = () => {
    if (!courseForm.name.trim()) return;
    if (editingCourseId) {
      setCoursesList(prev => prev.map(c => c.id === editingCourseId ? { ...c, name: courseForm.name, type: courseForm.type, status: courseForm.status, completion: Number(courseForm.completion) } : c));
    } else {
      setCoursesList([{
        id: Date.now(),
        name: courseForm.name,
        type: courseForm.type,
        participants: 0,
        completion: Number(courseForm.completion),
        status: courseForm.status
      }, ...coursesList]);
    }
    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = (id: number) => {
    setCoursesList(coursesList.filter(c => c.id !== id));
    setOpenActionMenuId(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSystemSettings(prev => ({...prev, logo: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettingsChange = (field: keyof SystemSettings, value: string) => {
    setSystemSettings(prev => ({...prev, [field]: value}));
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        const newEmployees: Employee[] = jsonData.map((row, index) => ({
          id: Date.now() + index,
          name: row['نام'] || row['Name'] || 'Unknown',
          department: row['واحد'] || row['Department'] || 'General',
          coursesCompleted: 0,
          lastTraining: '-',
          completedCoursesList: []
        }));
        setEmployeesList(prev => [...prev, ...newEmployees]);
      } catch (error) {
        alert('Error reading Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleHistoryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];
        setEmployeesList(prev => {
            const updated = [...prev];
            jsonData.forEach(row => {
                const name = row['Name'] || row['نام'];
                const course = row['Course'] || row['نام دوره'];
                if (name && course) {
                    let emp = updated.find(e => e.name.trim() === name.trim());
                    if (emp && !emp.completedCoursesList.some(c => c.name === course)) {
                        emp.completedCoursesList.push({
                            id: Date.now(),
                            name: course,
                            date: row['Date'] || '-',
                            score: row['Score'] || 0
                        });
                        emp.coursesCompleted = emp.completedCoursesList.length;
                    }
                }
            });
            return updated;
        });
      } catch (error) { console.error(error); }
    };
    reader.readAsBinaryString(file);
  };

  const handleAddYear = () => {
    const nextYear = (parseInt(yearsList[yearsList.length - 1]) + 1).toString();
    setYearsList([...yearsList, nextYear]);
    setSelectedYear(nextYear);
  };

  const addReportRow = (setter: any, key: string) => {
    if (!newRowData.courseName) return;
    setter((prev: any) => {
      const yData = prev[selectedYear] || {};
      const sData = yData[selectedDeptSeason] || {};
      const rows = sData[key] || [];
      const newRow = {
        id: Date.now(),
        ...newRowData,
        participants: Number(newRowData.participants) || 0,
        costPerPerson: Number(newRowData.costPerPerson) || 0,
        durationHours: Number(newRowData.durationHours) || 0,
        totalCost: (Number(newRowData.participants)||0) * (Number(newRowData.costPerPerson)||0),
        personHours: (Number(newRowData.participants)||0) * (Number(newRowData.durationHours)||0),
        location: newRowData.location || '-'
      };
      return { ...prev, [selectedYear]: { ...yData, [selectedDeptSeason]: { ...sData, [key]: [...rows, newRow] } } };
    });
    setNewRowData({ courseName: '', participants: 0, costPerPerson: 0, durationHours: 0, location: '' });
  };

  const deleteReportRow = (setter: any, key: string, id: number) => {
    setter((prev: any) => {
        const rows = prev[selectedYear]?.[selectedDeptSeason]?.[key] || [];
        return {
            ...prev,
            [selectedYear]: {
                ...prev[selectedYear],
                [selectedDeptSeason]: {
                    ...prev[selectedYear][selectedDeptSeason],
                    [key]: rows.filter((r: any) => r.id !== id)
                }
            }
        };
    });
  };

  const handleSyncFromUnits = () => {
      const units = unitReports[selectedYear]?.[selectedDeptSeason];
      if (!units) return alert("No data to sync");
      const agg: any = {};
      Object.values(units).flat().forEach((row: any) => {
          if (!agg[row.courseName]) agg[row.courseName] = { ...row, id: Date.now() + Math.random(), participants: 0, totalCost: 0, personHours: 0 };
          agg[row.courseName].participants += row.participants;
          agg[row.courseName].totalCost += row.totalCost;
          agg[row.courseName].personHours += row.personHours;
      });
      setGeneralCourseReports(prev => ({
          ...prev,
          [selectedYear]: { ...(prev[selectedYear]||{}), [selectedDeptSeason]: { ...(prev[selectedYear]?.[selectedDeptSeason]||{}), 'General': Object.values(agg) } }
      }));
      alert(lang === 'fa' ? "همگام‌سازی شد." : "Synced.");
  };

  const updateConsolidatedItem = (unit: string, field: string, val: number) => {
      setConsolidatedReports(prev => {
          const seasonList = prev[selectedYear]?.[selectedDeptSeason] || [];
          const idx = seasonList.findIndex(x => x.unitName === unit);
          const newList = [...seasonList];
          if (idx > -1) {
              newList[idx] = { ...newList[idx], [field]: val };
              if (field === 'totalHours' || field === 'totalPersonnel') {
                  newList[idx].personHours = newList[idx].totalHours * newList[idx].totalPersonnel;
              }
          } else {
              const newItem = { id: Date.now(), unitName: unit, totalHours: 0, totalCost: 0, totalPersonnel: 0, personHours: 0, [field]: val };
              if (field === 'totalHours' || field === 'totalPersonnel') newItem.personHours = newItem.totalHours * newItem.totalPersonnel;
              newList.push(newItem);
          }
          return { ...prev, [selectedYear]: { ...(prev[selectedYear]||{}), [selectedDeptSeason]: newList } };
      });
  };

  const handleSelectApiKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
       await window.aistudio.openSelectKey();
       const hasKey = await window.aistudio.hasSelectedApiKey();
       setHasApiKey(hasKey);
    }
  };

  const handleGenerateCertificate = async (courseName: string) => {
    if (!selectedEmployee) return;
    setIsGeneratingCert(true);
    try {
      const url = await generateCertificate(
        selectedEmployee.name, courseName, systemSettings.logo, 
        systemSettings.ceoName, systemSettings.trainingManagerName, certImageSize, lang,
        systemSettings.apiKey // PASS API KEY
      );
      setGeneratedCertUrl(url);
    } catch (e) { alert("Generation failed"); } 
    finally { setIsGeneratingCert(false); }
  };

  const handleGenerateContent = async () => {
      setIsGeneratingContent(true);
      try {
          let res;
          if (genForm.format === 'video') res = await generateTrainingVideo(genForm, lang, systemSettings.apiKey); // PASS API KEY
          else res = await generateTrainingDocument(genForm, lang, systemSettings.apiKey); // PASS API KEY
          
          if(genForm.format !== 'video') {
              const blob = new Blob([res], {type: 'text/markdown'});
              setGeneratedContentUrl(URL.createObjectURL(blob));
          } else {
              setGeneratedContentUrl(res);
          }
      } catch (e) { alert(e instanceof Error ? e.message : "Error"); }
      finally { setIsGeneratingContent(false); }
  };

  const runDashboardAnalysis = async () => {
      setIsAnalyzing(true);
      const res = await analyzeDashboardData({ courses: coursesList, employees: employeesList }, lang, systemSettings.apiKey); // PASS API KEY
      setDashboardAnalysis(res);
      setIsAnalyzing(false);
  };

  const handleSendMessage = async () => {
      if (!inputMessage.trim()) return;
      const msgs = [...messages, { role: 'user', content: inputMessage } as Message];
      setMessages(msgs);
      setInputMessage('');
      setIsTyping(true);
      try {
          const stream = streamGeminiResponse(inputMessage, msgs, lang, systemSettings.apiKey); // PASS API KEY
          let full = '';
          setMessages([...msgs, { role: 'assistant', content: '' }]);
          for await (const chunk of stream) {
              full += chunk;
              setMessages([...msgs, { role: 'assistant', content: full }]);
          }
      } catch(e) { /* handled in service */ }
      finally { setIsTyping(false); }
  };

  // --- Calculations for Dashboard ---
  const calculateDashboardStats = () => {
    const totalCourses = coursesList.length;
    const activeCourses = coursesList.filter(c => c.status === 'active').length;
    const completedCourses = coursesList.filter(c => c.status === 'completed').length;
    const totalEmployees = employeesList.length;
    const totalParticipants = coursesList.reduce((acc, curr) => acc + curr.participants, 0);
    const avgCompletion = totalCourses > 0 
      ? Math.round(coursesList.reduce((acc, curr) => acc + curr.completion, 0) / totalCourses) 
      : 0;

    const topEmployees = [...employeesList]
      .sort((a, b) => b.coursesCompleted - a.coursesCompleted)
      .slice(0, 5);

    const deptMap: {[key: string]: number} = {};
    employeesList.forEach(e => {
       deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });
    const deptData = Object.keys(deptMap).map(k => ({ name: k, value: deptMap[k] }));

    return { totalCourses, activeCourses, completedCourses, totalEmployees, totalParticipants, avgCompletion, topEmployees, deptData };
  };

  const dashStats = calculateDashboardStats();
  const filteredCourses = coursesList.filter(c => selectedCourseType === 'all' || c.type === selectedCourseType);
  const localizedMonthlyData = MONTHLY_TRAINING_DATA.map(d => ({ ...d, month: lang === 'en' ? d.month : 'ماه' }));
  const localizedDeptData = DEPARTMENT_DATA;

  const currentGeneralRows = generalCourseReports[selectedYear]?.[selectedDeptSeason]?.['General'] || [];
  const coursePerformanceData = currentGeneralRows.map((row, i) => ({
      name: i + 1, course: row.courseName, participants: row.participants, hours: row.durationHours, totalCost: row.totalCost
  }));
  
  const unitHistoryData = ['Spring', 'Summer', 'Fall', 'Winter'].map(s => ({
      name: s, personHours: (unitReports[selectedYear]?.[s as Season]?.[selectedUnitName] || []).reduce((a:any,b:any)=>a+b.personHours,0)
  }));

  const consolidatedData = ORGANIZATIONAL_UNITS.map(u => {
      const item = consolidatedReports[selectedYear]?.[selectedDeptSeason]?.find(x => x.unitName === u);
      return { name: u, value: item ? (consolidatedChartMetric === 'totalCost' ? item.totalCost : consolidatedChartMetric === 'personHours' ? item.personHours : item.totalPersonnel) : 0 };
  }).filter(x => x.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className={`flex h-[100dvh] bg-slate-50 text-slate-800 font-sans ${isRTL ? 'font-[Vazirmatn]' : ''} overflow-hidden`}>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold text-center py-1 z-[60] animate-pulse">
           {lang === 'fa' ? 'حالت آفلاین فعال است - تغییرات ذخیره می‌شوند' : 'Offline Mode Active - Changes will be saved locally'}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-white w-72 lg:w-64 fixed h-[100dvh] z-30 transition-transform duration-300 flex flex-col 
        ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')} 
        ${isRTL ? 'right-0' : 'left-0'} lg:static shrink-0`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`bg-${theme}-600 p-2 rounded-lg`}>
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg lg:text-xl tracking-tight truncate">{t.app_name}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 p-1 hover:text-white rounded-md"><X size={24} /></button>
        </div>
        <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto no-scrollbar">
          {tabsConfig.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? `bg-${theme}-600 text-white shadow-lg` : 'text-slate-400 hover:bg-slate-800'}`}>
              <tab.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm truncate">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 shrink-0 mt-auto safe-area-bottom">
           <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                 <div className={`w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white`}>TM</div>
                 <div className="overflow-hidden"><p className="text-xs font-semibold text-white truncate">{t.role_training_manager}</p></div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                 {isOnline ? <Cloud size={12} className="text-emerald-400"/> : <CloudOff size={12} className="text-red-400"/>}
                 {isOnline ? 'Online' : 'Offline Mode'}
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between shrink-0 safe-area-top">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24}/></button>
             <h1 className="font-bold text-lg text-slate-800 truncate">{tabsConfig.find(t => t.id === activeTab)?.label}</h1>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="text-sm font-bold uppercase text-slate-600 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors">{lang}</button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-20">
           {/* DASHBOARD (REVAMPED) */}
           {activeTab === Tab.Dashboard && (
              <div className="space-y-6">
                 {/* Header & AI Trigger */}
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                       <h2 className="text-xl md:text-2xl font-bold text-slate-800">{t.dash_title}</h2>
                       <p className="text-slate-500 text-xs md:text-sm mt-1">{t.dash_subtitle}</p>
                    </div>
                    <button onClick={runDashboardAnalysis} className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95">
                       {isAnalyzing ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} 
                       <span className="font-medium">{t.btn_ai_analysis}</span>
                    </button>
                 </div>

                 {/* AI Analysis Result */}
                 {dashboardAnalysis && (
                    <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl animate-fade-in shadow-sm">
                       <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
                          <Bot size={20}/>
                          <span>تحلیل هوشمند سیستم</span>
                       </div>
                       <div className="text-indigo-900 text-sm leading-relaxed whitespace-pre-wrap">{dashboardAnalysis}</div>
                    </div>
                 )}
                 
                 {/* KPI Cards Row */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Employees */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                       <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={20}/></div>
                             <span className="text-slate-500 text-sm font-medium">{lang==='fa'?'پرسنل فعال':'Active Employees'}</span>
                          </div>
                          <div className="text-3xl font-bold text-slate-800">{dashStats.totalEmployees}</div>
                          <div className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1"><TrendingUp size={12}/> +2 این ماه</div>
                       </div>
                    </div>

                    {/* Card 2: Active Courses */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                       <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><BookOpen size={20}/></div>
                             <span className="text-slate-500 text-sm font-medium">{lang==='fa'?'دوره‌های فعال':'Active Courses'}</span>
                          </div>
                          <div className="text-3xl font-bold text-slate-800">{dashStats.activeCourses} <span className="text-base font-normal text-slate-400">/ {dashStats.totalCourses}</span></div>
                          <div className="text-xs text-slate-400 font-medium mt-1">{lang==='fa'?'دوره در حال برگزاری':'courses running'}</div>
                       </div>
                    </div>

                    {/* Card 3: Total Participants */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                       <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Activity size={20}/></div>
                             <span className="text-slate-500 text-sm font-medium">{lang==='fa'?'فراگیران':'Participants'}</span>
                          </div>
                          <div className="text-3xl font-bold text-slate-800">{dashStats.totalParticipants}</div>
                          <div className="text-xs text-amber-600 font-medium mt-1">{lang==='fa'?'نفر در کل دوره‌ها':'total enrollments'}</div>
                       </div>
                    </div>

                    {/* Card 4: Avg Score / Efficiency */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                       <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Target size={20}/></div>
                             <span className="text-slate-500 text-sm font-medium">{lang==='fa'?'بازدهی آموزش':'Avg. Score'}</span>
                          </div>
                          <div className="text-3xl font-bold text-slate-800">88%</div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                             <div className="bg-rose-500 h-full rounded-full" style={{width: '88%'}}></div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Main Charts Row */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Area Chart */}
                    <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><Zap size={18} className="text-amber-500"/> {t.chart_monthly}</h3>
                          <div className="flex gap-2">
                             <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500">1403</span>
                          </div>
                       </div>
                       <div style={{ height: 300, width: '100%' }}>
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={localizedMonthlyData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                <defs>
                                   <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10}/>
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}}/>
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                                <CartesianGrid vertical={false} stroke="#f1f5f9"/>
                                <Area type="monotone" dataKey="participants" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorParticipants)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    {/* Department Distribution Pie Chart */}
                    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                       <h3 className="font-bold text-base md:text-lg text-slate-800 mb-6 flex items-center gap-2"><Building2 size={18} className="text-indigo-500"/> {t.chart_dist}</h3>
                       <div style={{ height: 300, width: '100%' }} className="relative">
                          <ResponsiveContainer width="100%" height="100%">
                             <RechartsPieChart>
                                <Pie
                                   data={dashStats.deptData}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={60}
                                   outerRadius={80}
                                   paddingAngle={5}
                                   dataKey="value"
                                >
                                   {dashStats.deptData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                   ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '11px', paddingTop: '20px'}}/>
                             </RechartsPieChart>
                          </ResponsiveContainer>
                          {/* Center Text */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                             <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800">{dashStats.totalEmployees}</div>
                                <div className="text-xs text-slate-400">Total</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Bottom Lists Row */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                       <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Award size={18} className="text-amber-500"/> {lang==='fa'?'پرسنل برتر آموزشی':'Top Learners'}</h3>
                       <div className="space-y-4">
                          {dashStats.topEmployees.length > 0 ? dashStats.topEmployees.map((emp, i) => (
                             <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${i===0?'bg-amber-400':i===1?'bg-slate-400':'bg-orange-400'}`}>
                                      {i+1}
                                   </div>
                                   <div>
                                      <div className="font-bold text-sm text-slate-800">{emp.name}</div>
                                      <div className="text-xs text-slate-500">{emp.department}</div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className="text-right">
                                      <div className="font-bold text-sm text-indigo-600">{emp.coursesCompleted} {lang==='fa'?'دوره':'Courses'}</div>
                                      <div className="text-[10px] text-slate-400">Score: {emp.completedCoursesList.length > 0 ? 95 : 0}</div>
                                   </div>
                                </div>
                             </div>
                          )) : (
                             <div className="text-center text-slate-400 py-8">No data available</div>
                          )}
                       </div>
                    </div>

                    {/* Recent Courses / Quick Actions */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                       <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-blue-500"/> {lang==='fa'?'دوره‌های اخیر':'Recent Courses'}</h3>
                       <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left whitespace-nowrap">
                             <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                   <th className="p-3 rounded-l-lg">{t.col_course_name}</th>
                                   <th className="p-3">{t.col_status}</th>
                                   <th className="p-3 rounded-r-lg">{t.col_participants}</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                {coursesList.slice(0, 4).map(c => (
                                   <tr key={c.id}>
                                      <td className="p-3 font-medium text-slate-700">{c.name}</td>
                                      <td className="p-3">
                                         <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.status==='active'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>
                                            {c.status.toUpperCase()}
                                         </span>
                                      </td>
                                      <td className="p-3 text-slate-600">{c.participants}</td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                       <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                          <button onClick={() => setActiveTab(Tab.Courses)} className="text-sm text-blue-600 font-bold hover:underline">{lang==='fa'?'مشاهده همه دوره‌ها':'View All Courses'}</button>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {/* COURSES (Persisted) */}
           {activeTab === Tab.Courses && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl md:text-2xl font-bold">{t.course_manage_title}</h2>
                    <button onClick={() => openCourseModal()} className="bg-blue-600 text-white px-3 py-2 text-sm md:text-base rounded-lg flex gap-2 items-center hover:bg-blue-700 transition-colors"><Plus size={18}/> <span className="hidden md:inline">{t.btn_new_course}</span><span className="md:hidden">New</span></button>
                 </div>
                 <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left whitespace-nowrap">
                         <thead className="bg-slate-50 text-slate-500">
                            <tr><th className="p-4">{t.col_course_name}</th><th className="p-4">{t.col_participants}</th><th className="p-4">{t.col_status}</th><th className="p-4"></th></tr>
                         </thead>
                         <tbody className="divide-y">
                            {filteredCourses.map(c => (
                               <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-4">{c.name}</td>
                                  <td className="p-4">{c.participants}</td>
                                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status==='active'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{c.status}</span></td>
                                  <td className="p-4 text-right"><button onClick={() => handleDeleteCourse(c.id)} className="text-red-500 hover:text-red-700 p-2"><Trash size={16}/></button></td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                 </div>
              </div>
           )}

           {/* EMPLOYEES (Persisted) */}
           {activeTab === Tab.Employees && (
              <div className="space-y-6">
                 {!selectedEmployee ? (
                    <>
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <h2 className="text-2xl font-bold">{t.emp_title}</h2>
                          <div className="flex gap-2 w-full md:w-auto">
                             <label className="bg-white border hover:bg-slate-50 transition-colors px-4 py-2 rounded-lg cursor-pointer flex-1 md:flex-none text-center text-sm shadow-sm flex items-center justify-center gap-2">
                                <FileSpreadsheet size={16} className="text-green-600"/>
                                <input type="file" hidden onChange={handleExcelUpload}/>Import Excel
                             </label>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {employeesList.map(e => (
                             <div key={e.id} onClick={() => setSelectedEmployee(e)} className="bg-white p-4 rounded-xl border hover:shadow-md cursor-pointer transition-all active:scale-98">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">{e.name.charAt(0)}</div>
                                   <div>
                                      <div className="font-bold text-slate-800">{e.name}</div>
                                      <div className="text-sm text-slate-500">{e.department}</div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </>
                 ) : (
                    <div className="bg-white p-4 md:p-6 rounded-2xl border min-h-[600px] shadow-sm">
                       <button onClick={() => setSelectedEmployee(null)} className="mb-4 text-slate-500 flex items-center gap-1 hover:text-slate-800"><ChevronRight className={isRTL ? '' : 'rotate-180'} size={18}/> Back</button>
                       <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">{selectedEmployee.name.charAt(0)}</div>{selectedEmployee.name}</h2>
                       <div className="grid lg:grid-cols-2 gap-8">
                          <div>
                             <h3 className="font-bold mb-4 text-slate-700">{t.emp_history_title}</h3>
                             <div className="space-y-2">
                                {selectedEmployee.completedCoursesList.map(c => (
                                   <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                      <span className="text-sm font-medium">{c.name}</span>
                                      <button onClick={() => handleGenerateCertificate(c.name)} className="text-blue-600 text-xs font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"><Award size={14}/> Cert</button>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-xl text-center border border-dashed border-slate-300 flex items-center justify-center min-h-[300px]">
                             {isGeneratingCert ? <Loader2 className="animate-spin mx-auto text-blue-500" size={32}/> : generatedCertUrl ? (
                                <div className="relative group w-full">
                                   <img src={generatedCertUrl} className="w-full shadow-lg rounded-lg"/>
                                   <a href={generatedCertUrl} download="cert.png" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity rounded-lg">Download</a>
                                </div>
                             ) : <div className="text-slate-400 flex flex-col items-center gap-2"><Award size={48} className="text-slate-300"/> Select a course to generate certificate</div>}
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           )}

           {/* REPORTS (Fully Persisted & Tabbed) */}
           {activeTab === Tab.Reports && (
              <div className="space-y-6">
                 {/* Controls */}
                 <div className="bg-white p-4 rounded-2xl border flex flex-col md:flex-row justify-between gap-4 shadow-sm">
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                       {(['courses', 'units', 'consolidated'] as const).map(sub => (
                          <button key={sub} onClick={() => setActiveReportSubTab(sub)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeReportSubTab === sub ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                             {sub === 'courses' ? t.dept_report_title : sub === 'units' ? t.unit_report_title : t.consolidated_report_title}
                          </button>
                       ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                       <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">{yearsList.map(y => <option key={y} value={y}>{y}</option>)}</select>
                       <select value={selectedDeptSeason} onChange={e => setSelectedDeptSeason(e.target.value as Season)} className="bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">{['Spring','Summer','Fall','Winter'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                       <button onClick={handleAddYear} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600"><Plus size={16}/></button>
                    </div>
                 </div>

                 {/* Report 1: General */}
                 {activeReportSubTab === 'courses' && (
                    <div className="bg-white p-4 md:p-6 rounded-2xl border space-y-6 shadow-sm">
                       <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">{t.dept_report_title}</h3>
                          <button onClick={handleSyncFromUnits} className="flex gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm items-center hover:bg-slate-800"><Layers size={14}/> <span className="hidden md:inline">Sync from Units</span><span className="md:hidden">Sync</span></button>
                       </div>
                       {/* Input Row */}
                       <div className="grid grid-cols-1 md:grid-cols-6 gap-2 bg-slate-50 p-4 rounded-xl items-end border border-slate-100">
                          <div className="md:col-span-2"><label className="text-xs font-bold block mb-1 text-slate-500">Course</label><input className="w-full border rounded p-2 text-sm" placeholder="Course Name" value={newRowData.courseName} onChange={e => setNewRowData({...newRowData, courseName: e.target.value})}/></div>
                          <div><label className="text-xs font-bold block mb-1 text-slate-500">Users</label><input type="number" className="w-full border rounded p-2 text-sm" placeholder="0" value={newRowData.participants} onChange={e => setNewRowData({...newRowData, participants: Number(e.target.value)})}/></div>
                          <div><label className="text-xs font-bold block mb-1 text-slate-500">Cost/User</label><input type="number" className="w-full border rounded p-2 text-sm" placeholder="0" value={newRowData.costPerPerson} onChange={e => setNewRowData({...newRowData, costPerPerson: Number(e.target.value)})}/></div>
                          <div><label className="text-xs font-bold block mb-1 text-slate-500">Hours</label><input type="number" className="w-full border rounded p-2 text-sm" placeholder="0" value={newRowData.durationHours} onChange={e => setNewRowData({...newRowData, durationHours: Number(e.target.value)})}/></div>
                          <button onClick={() => addReportRow(setGeneralCourseReports, 'General')} className="bg-emerald-600 text-white rounded p-2 w-full flex items-center justify-center hover:bg-emerald-700 mt-2 md:mt-0"><Plus size={20}/></button>
                       </div>
                       {/* Table */}
                       <div className="overflow-x-auto">
                          <table className="w-full text-sm whitespace-nowrap">
                             <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 text-left">Course</th><th className="p-3 text-left">Users</th><th className="p-3 text-left">Cost</th><th className="p-3 text-left">Total</th><th className="p-3"></th></tr></thead>
                             <tbody>
                                {currentGeneralRows.map((row: any) => (
                                   <tr key={row.id} className="border-b hover:bg-slate-50">
                                      <td className="p-3">{row.courseName}</td>
                                      <td className="p-3">{row.participants}</td>
                                      <td className="p-3">{row.totalCost.toLocaleString()}</td>
                                      <td className="p-3 font-bold">{row.totalCost.toLocaleString()}</td>
                                      <td className="p-3"><button onClick={() => deleteReportRow(setGeneralCourseReports, 'General', row.id)} className="text-red-500 hover:text-red-700"><Trash size={14}/></button></td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                       <div style={{ width: '100%', height: 320 }}><ResponsiveContainer width="100%" height="100%"><ComposedChart data={coursePerformanceData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="participants" fill="#8884d8" radius={[4,4,0,0]} barSize={40}/><Line type="monotone" dataKey="totalCost" stroke="#ff7300" strokeWidth={2}/></ComposedChart></ResponsiveContainer></div>
                    </div>
                 )}

                 {/* Report 3: Unit Specific */}
                 {activeReportSubTab === 'units' && (
                    <div className="bg-white p-4 md:p-6 rounded-2xl border space-y-6 shadow-sm">
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <h3 className="font-bold text-lg">{t.unit_report_title}</h3>
                          <select value={selectedUnitName} onChange={e => setSelectedUnitName(e.target.value)} className="border rounded p-2 text-sm w-full md:w-auto">{ORGANIZATIONAL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-6 gap-2 bg-slate-50 p-4 rounded-xl items-end border border-slate-100">
                          <div className="md:col-span-2"><input placeholder="Course Name" className="w-full border rounded p-2 text-sm" value={newRowData.courseName} onChange={e => setNewRowData({...newRowData, courseName: e.target.value})}/></div>
                          <div><input type="number" placeholder="Users" className="w-full border rounded p-2 text-sm" value={newRowData.participants} onChange={e => setNewRowData({...newRowData, participants: Number(e.target.value)})}/></div>
                          <div><input type="number" placeholder="Cost" className="w-full border rounded p-2 text-sm" value={newRowData.costPerPerson} onChange={e => setNewRowData({...newRowData, costPerPerson: Number(e.target.value)})}/></div>
                          <div><input type="number" placeholder="Hours" className="w-full border rounded p-2 text-sm" value={newRowData.durationHours} onChange={e => setNewRowData({...newRowData, durationHours: Number(e.target.value)})}/></div>
                          <button onClick={() => addReportRow(setUnitReports, selectedUnitName)} className="bg-blue-600 text-white rounded p-2 w-full flex items-center justify-center hover:bg-blue-700 mt-2 md:mt-0"><Plus size={20}/></button>
                       </div>
                       <div className="overflow-x-auto">
                          <table className="w-full text-sm whitespace-nowrap">
                             <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 text-left">Course</th><th className="p-3 text-left">Users</th><th className="p-3 text-left">Hours</th><th className="p-3 text-left">Total Cost</th><th className="p-3"></th></tr></thead>
                             <tbody>
                                {(unitReports[selectedYear]?.[selectedDeptSeason]?.[selectedUnitName] || []).map((row: any) => (
                                   <tr key={row.id} className="border-b hover:bg-slate-50">
                                      <td className="p-3">{row.courseName}</td>
                                      <td className="p-3">{row.participants}</td>
                                      <td className="p-3">{row.durationHours}</td>
                                      <td className="p-3 font-bold">{row.totalCost.toLocaleString()}</td>
                                      <td className="p-3"><button onClick={() => deleteReportRow(setUnitReports, selectedUnitName, row.id)} className="text-red-500 hover:text-red-700"><Trash size={14}/></button></td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                       <div style={{ width: '100%', height: 320 }}><ResponsiveContainer width="100%" height="100%"><RechartsBarChart data={unitHistoryData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="personHours" fill="#3b82f6" radius={[4,4,0,0]} barSize={40}/></RechartsBarChart></ResponsiveContainer></div>
                    </div>
                 )}

                 {/* Report 2: Consolidated */}
                 {activeReportSubTab === 'consolidated' && (
                    <div className="bg-white p-4 md:p-6 rounded-2xl border space-y-6 shadow-sm">
                        <div className="flex justify-between items-center">
                           <h3 className="font-bold text-lg">{t.consolidated_report_title}</h3>
                           <div className="flex gap-2">
                              <button onClick={() => setConsolidatedChartMetric('totalCost')} className={`text-xs px-2 py-1 rounded transition-colors ${consolidatedChartMetric === 'totalCost' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Cost</button>
                              <button onClick={() => setConsolidatedChartMetric('personHours')} className={`text-xs px-2 py-1 rounded transition-colors ${consolidatedChartMetric === 'personHours' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Hours</button>
                           </div>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm whitespace-nowrap">
                              <thead className="bg-slate-50 text-slate-500"><tr><th className="p-2 text-left">Unit</th><th className="p-2 text-left">Hours</th><th className="p-2 text-left">Cost</th><th className="p-2 text-left">Personnel</th><th className="p-2 text-left">Total P-H</th></tr></thead>
                              <tbody>
                                 {ORGANIZATIONAL_UNITS.map(u => {
                                    const item = consolidatedReports[selectedYear]?.[selectedDeptSeason]?.find(x => x.unitName === u) || { totalHours:0, totalCost:0, totalPersonnel:0, personHours:0 };
                                    return (
                                       <tr key={u} className="border-b hover:bg-slate-50">
                                          <td className="p-2 font-medium text-slate-700">{u}</td>
                                          <td><input type="number" className="w-16 bg-transparent border-b focus:border-blue-500 outline-none" value={item.totalHours||''} onChange={e => updateConsolidatedItem(u, 'totalHours', Number(e.target.value))}/></td>
                                          <td><input type="number" className="w-24 bg-transparent border-b focus:border-blue-500 outline-none" value={item.totalCost||''} onChange={e => updateConsolidatedItem(u, 'totalCost', Number(e.target.value))}/></td>
                                          <td><input type="number" className="w-16 bg-transparent border-b focus:border-blue-500 outline-none" value={item.totalPersonnel||''} onChange={e => updateConsolidatedItem(u, 'totalPersonnel', Number(e.target.value))}/></td>
                                          <td className="font-bold text-purple-600">{item.personHours.toLocaleString()}</td>
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                        </div>
                        <div style={{ width: '100%', height: 320 }}><ResponsiveContainer width="100%" height="100%"><RechartsBarChart data={consolidatedData} margin={{bottom: 100}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" angle={-90} textAnchor="end" interval={0} height={100} tick={{fontSize: 10}}/><YAxis/><Tooltip/><Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]}/></RechartsBarChart></ResponsiveContainer></div>
                    </div>
                 )}
              </div>
           )}

           {/* AI (Offline Aware) */}
           {activeTab === Tab.AI && (
              <div className="h-[calc(100dvh-140px)] bg-white rounded-2xl border flex flex-col shadow-sm">
                 <div className="p-4 border-b flex justify-between bg-slate-50 rounded-t-2xl">
                    <div className="flex gap-2"><button onClick={() => setAiMode('chat')} className={`px-3 py-1 rounded text-sm transition-all ${aiMode==='chat'?'bg-white shadow text-slate-800 font-bold':'text-slate-500'}`}>{t.ai_mode_chat}</button><button onClick={() => setAiMode('studio')} className={`px-3 py-1 rounded text-sm transition-all ${aiMode==='studio'?'bg-white shadow text-slate-800 font-bold':'text-slate-500'}`}>{t.ai_mode_studio}</button></div>
                 </div>
                 {aiMode === 'chat' ? (
                    <>
                       <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {messages.map((m,i)=><div key={i} className={`p-3 rounded-lg max-w-[85%] text-sm ${m.role==='user'?'ml-auto bg-blue-600 text-white shadow-sm':'bg-slate-100 text-slate-700'}`}>{m.content}</div>)}
                          {isTyping && <div className="text-xs text-slate-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Typing...</div>}
                          <div ref={chatEndRef}/>
                       </div>
                       <div className="p-4 border-t flex gap-2">
                          <input value={inputMessage} onChange={e=>setInputMessage(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSendMessage()} className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder={isOnline?"Message AI...":"Message Offline Bot..."} />
                          <button onClick={handleSendMessage} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"><Send size={20}/></button>
                       </div>
                    </>
                 ) : (
                    <div className="p-6 space-y-4 max-w-lg mx-auto overflow-y-auto w-full">
                       <h3 className="font-bold text-center text-lg">{t.studio_title} {isOnline ? '' : '(Offline Mode)'}</h3>
                       <input className="w-full border rounded p-3 text-sm" placeholder="Topic" value={genForm.topic} onChange={e=>setGenForm({...genForm, topic: e.target.value})}/>
                       <input className="w-full border rounded p-3 text-sm" placeholder="Audience" value={genForm.targetAudience} onChange={e=>setGenForm({...genForm, targetAudience: e.target.value})}/>
                       <select className="w-full border rounded p-3 text-sm bg-white" value={genForm.format} onChange={e=>setGenForm({...genForm, format: e.target.value as ContentFormat})}><option value="pamphlet">Pamphlet</option><option value="powerpoint">PowerPoint</option><option value="video">Video (Online Only)</option></select>
                       <button onClick={handleGenerateContent} disabled={isGeneratingContent} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center gap-2 items-center hover:bg-blue-700 shadow-md transition-all active:scale-95">{isGeneratingContent?<Loader2 className="animate-spin"/>:<Wand2/>} Generate Content</button>
                       {generatedContentUrl && <a href={generatedContentUrl} download="content.md" className="block text-center text-blue-600 font-bold mt-4 border border-blue-200 p-3 rounded-xl hover:bg-blue-50">Download Generated Content</a>}
                    </div>
                 )}
              </div>
           )}

           {/* Settings */}
           {activeTab === Tab.Settings && (
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                 <h2 className="text-xl font-bold mb-4">{t.settings_title}</h2>
                 <div className="space-y-4 max-w-md w-full">
                    <div><label className="block text-xs font-bold mb-1 text-slate-500">Company Name</label><input className="w-full border rounded p-2 text-sm" value={systemSettings.companyName} onChange={e=>handleSettingsChange('companyName',e.target.value)}/></div>
                    <div><label className="block text-xs font-bold mb-1 text-slate-500">Logo</label><input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={handleLogoUpload}/>{systemSettings.logo && <img src={systemSettings.logo} className="h-16 mt-2 object-contain"/>}</div>
                    
                    {/* API Key Input */}
                    <div className="bg-slate-50 p-4 rounded-xl border mt-4">
                       <div className="flex justify-between items-center mb-2">
                           <h3 className="font-bold text-sm flex items-center gap-2"><KeyRound size={16}/> Google Gemini API Key</h3>
                           <button onClick={() => setShowApiKey(!showApiKey)} className="text-slate-400 hover:text-slate-600">
                               {showApiKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                           </button>
                       </div>
                       <input 
                           type={showApiKey ? "text" : "password"}
                           className="w-full border rounded p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                           placeholder="Enter your API Key here..."
                           value={systemSettings.apiKey || ''}
                           onChange={e => handleSettingsChange('apiKey', e.target.value)}
                       />
                       <p className="text-[10px] text-slate-400 mt-1">
                           {lang === 'fa' ? 'این کلید فقط در مرورگر شما ذخیره می‌شود.' : 'Stored locally in your browser.'}
                       </p>
                    </div>

                    <div className="flex gap-3 mt-4">
                       {['blue','emerald','violet','rose','amber'].map((c:any) => <button key={c} onClick={()=>setTheme(c)} className={`w-8 h-8 rounded-full bg-${c}-500 ${theme===c?'ring-2 ring-offset-2 ring-slate-400 scale-110':''} transition-all`}/>)}
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* Modal */}
        {isCourseModalOpen && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 shadow-xl animate-scale-up">
                 <h3 className="font-bold text-lg">Course Details</h3>
                 <input className="w-full border rounded p-2" placeholder="Course Name" value={courseForm.name} onChange={e=>setCourseForm({...courseForm, name: e.target.value})}/>
                 <div className="flex gap-2">
                    <select className="w-1/2 border rounded p-2 bg-white" value={courseForm.type} onChange={e=>setCourseForm({...courseForm, type: e.target.value as any})}><option value="internal">Internal</option><option value="external">External</option></select>
                    <select className="w-1/2 border rounded p-2 bg-white" value={courseForm.status} onChange={e=>setCourseForm({...courseForm, status: e.target.value as any})}><option value="active">Active</option><option value="completed">Completed</option></select>
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button onClick={()=>setIsCourseModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSaveCourse} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                 </div>
              </div>
           </div>
        )}

        {/* Save Indicator */}
        {showSaveIndicator && <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-full text-xs shadow-lg flex items-center gap-2 z-50 animate-fade-in"><Save size={14}/> Saved</div>}
      </main>
    </div>
  );
};

export default App;