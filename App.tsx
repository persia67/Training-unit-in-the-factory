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
  Cell
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
  Code2
} from 'lucide-react';
import { 
  COURSES, 
  EMPLOYEES, 
  MONTHLY_TRAINING_DATA, 
  DEPARTMENT_DATA, 
  TRANSLATIONS,
  APP_VERSION
} from './constants';
import { Tab, Language, ThemeColor, Message, Employee, ImageSize, SystemSettings, UserRole, SeasonalData, Season, ContentGenerationRequest, ContentFormat } from './types';
import { streamGeminiResponse, analyzeDashboardData, GeminiLiveSession, generateCertificate, generateTrainingVideo, generateTrainingDocument } from './services/geminiService';

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  // Load initial state from local storage
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('app_lang') as Language) || 'fa');
  const [theme, setTheme] = useState<ThemeColor>(() => (localStorage.getItem('app_theme') as ThemeColor) || 'blue');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('developer');
  
  // Settings State with Persistence
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('systemSettings');
    return saved ? JSON.parse(saved) : {
      companyName: 'Danial Steel Co.',
      ceoName: '',
      trainingManagerName: '',
      logo: null
    };
  });

  // Visual feedback state
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const isFirstRun = useRef(true);

  // Auto-save effects
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  // Unified visual feedback trigger
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setShowSaveIndicator(true);
    const timer = setTimeout(() => setShowSaveIndicator(false), 2000);
    return () => clearTimeout(timer);
  }, [lang, theme, systemSettings]);

  // Data State
  const [coursesList, setCoursesList] = useState(COURSES);
  const [employeesList, setEmployeesList] = useState<Employee[]>(EMPLOYEES);
  const [pastReportData, setPastReportData] = useState<any[]>([]);
  const [pastReportFileName, setPastReportFileName] = useState<string>('');
  const [priorityHeaders, setPriorityHeaders] = useState<string[]>([]);
  
  // Seasonal Reporting State
  const [seasonalData, setSeasonalData] = useState<SeasonalData>(() => {
    // Initial dummy data for 1403
    return {
      '1403': {
        pattern: ['Category', 'Participants', 'Hours', 'Cost'],
        seasons: {
          'Spring': [
             { Category: 'Safety', Participants: 120, Hours: 450, Cost: 5000 },
             { Category: 'Technical', Participants: 80, Hours: 300, Cost: 8000 },
             { Category: 'Management', Participants: 20, Hours: 100, Cost: 2000 }
          ]
        }
      }
    };
  });
  const [selectedYear, setSelectedYear] = useState<string>('1403');
  const [yearsList, setYearsList] = useState<string[]>(['1403']);
  const [activeAnalysisData, setActiveAnalysisData] = useState<any[] | null>(null);
  const [activeAnalysisTitle, setActiveAnalysisTitle] = useState<string>('');
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false);
  const [manualEntryTarget, setManualEntryTarget] = useState<{year: string, season: Season} | null>(null);
  const [manualEntryForm, setManualEntryForm] = useState<Record<string, string>>({});

  // Modal & Action Menu State for Courses
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<{name: string, type: 'internal' | 'external', status: 'active' | 'completed', completion: number}>({
    name: '', type: 'internal', status: 'active', completion: 0
  });

  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [selectedCourseType, setSelectedCourseType] = useState<'all' | 'internal' | 'external'>('all');

  // Employee Detail & Certificate State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [generatedCertUrl, setGeneratedCertUrl] = useState<string | null>(null);
  const [certImageSize, setCertImageSize] = useState<ImageSize>('1K');
  const [hasApiKey, setHasApiKey] = useState(false);

  // AI Chat & Studio State
  const [aiMode, setAiMode] = useState<'chat' | 'studio'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [templateAnalysis, setTemplateAnalysis] = useState<string | null>(null);
  
  // Content Generation State
  const [genForm, setGenForm] = useState<ContentGenerationRequest>({
    topic: '', description: '', targetAudience: '', format: 'pamphlet'
  });
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContentUrl, setGeneratedContentUrl] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveSession = useRef<GeminiLiveSession | null>(null);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'fa';

  // Access Control Helpers
  const canEditContent = ['developer', 'training_manager'].includes(userRole);
  const canEditSettings = ['developer', 'factory_manager'].includes(userRole);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  useEffect(() => {
    if (chatEndRef.current && aiMode === 'chat') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiMode]);

  // Check for API key availability on mount/updates
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, [activeTab, selectedEmployee]);

  const tabsConfig = [
    { id: Tab.Dashboard, label: t.dashboard, icon: LayoutDashboard },
    { id: Tab.Courses, label: t.courses, icon: BookOpen },
    { id: Tab.Employees, label: t.employees, icon: Users },
    { id: Tab.Reports, label: t.reports, icon: FileBarChart },
    { id: Tab.AI, label: t.ai, icon: Bot },
    { id: Tab.Settings, label: t.settings, icon: Settings },
  ];

  // Logic for Course Management (Add/Edit)
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
      // Edit existing
      setCoursesList(prev => prev.map(c => 
        c.id === editingCourseId 
          ? { ...c, name: courseForm.name, type: courseForm.type, status: courseForm.status, completion: Number(courseForm.completion) } 
          : c
      ));
    } else {
      // Create new
      const newCourse = {
        id: Date.now(),
        name: courseForm.name,
        type: courseForm.type,
        participants: 0,
        completion: Number(courseForm.completion),
        status: courseForm.status
      };
      setCoursesList([newCourse, ...coursesList]);
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

  // Logic to handle Excel upload for employees
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const newEmployees: Employee[] = jsonData.map((row: any, index: number) => ({
          id: Date.now() + index,
          name: row['نام'] || row['Name'] || 'Unknown',
          department: row['واحد'] || row['Department'] || 'General',
          coursesCompleted: 0,
          lastTraining: '-',
          completedCoursesList: []
        }));

        setEmployeesList(prev => [...prev, ...newEmployees]);
        alert(lang === 'fa' ? `${newEmployees.length} نفر با موفقیت اضافه شدند.` : `${newEmployees.length} employees added successfully.`);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert(lang === 'fa' ? 'خطا در خواندن فایل اکسل.' : 'Error reading Excel file.');
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
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        setEmployeesList(prev => {
            const updated = [...prev];
            let recordsAdded = 0;
            
            jsonData.forEach((row: any) => {
                const name = row['Name'] || row['نام'] || row['نام و نام خانوادگی'];
                const course = row['Course'] || row['نام دوره'] || row['عنوان دوره'];
                const date = row['Date'] || row['تاریخ'] || row['تاریخ برگزاری'];
                const score = row['Score'] || row['نمره'];
                const dept = row['Department'] || row['واحد'] || row['دپارتمان'];

                if (name && course) {
                    let emp = updated.find(e => e.name.trim() === name.trim());
                    if (!emp) {
                         emp = {
                            id: Date.now() + Math.random(),
                            name: name.trim(),
                            department: dept || 'General',
                            coursesCompleted: 0,
                            lastTraining: '-',
                            completedCoursesList: []
                         };
                         updated.push(emp);
                    }
                    const exists = emp.completedCoursesList.some(
                        c => c.name === course && c.date === (date || '-')
                    );
                    if (!exists) {
                        emp.completedCoursesList.push({
                            id: Date.now() + Math.random(),
                            name: course,
                            date: date || '-',
                            score: Number(score) || 0
                        });
                        recordsAdded++;
                    }
                    emp.coursesCompleted = emp.completedCoursesList.length;
                    if (date) emp.lastTraining = date;
                }
            });
            if (recordsAdded === 0) return prev; 
            return updated;
        });
        event.target.value = '';
        alert(lang === 'fa' ? 'سوابق با موفقیت بروزرسانی شد.' : 'Records updated successfully.');
      } catch (error) {
        console.error(error);
        alert(lang === 'fa' ? 'خطا در خواندن فایل.' : 'Error reading file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePastReportUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPastReportFileName(file.name);
    setTemplateAnalysis(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setPastReportData(jsonData as any[]);
        if (jsonData.length > 0) {
          setPriorityHeaders(Object.keys(jsonData[0]));
        }
      } catch (error) {
        console.error('Error parsing Past Report Excel:', error);
        alert(lang === 'fa' ? 'خطا در خواندن فایل اکسل.' : 'Error reading Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Seasonal Upload Logic
  const handleSeasonalUpload = (event: React.ChangeEvent<HTMLInputElement>, season: Season) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        if (jsonData.length === 0) return;

        setSeasonalData(prev => {
           const newData = { ...prev };
           if (!newData[selectedYear]) {
              newData[selectedYear] = { pattern: [], seasons: {} };
           }
           
           // If no pattern exists for this year, set it from the first upload
           if (!newData[selectedYear].pattern || newData[selectedYear].pattern.length === 0) {
              newData[selectedYear].pattern = Object.keys(jsonData[0]);
           }

           newData[selectedYear].seasons[season] = jsonData;
           return newData;
        });

        // Automatically show analysis for this new upload
        setActiveAnalysisData(jsonData);
        setActiveAnalysisTitle(`${t[`season_${season.toLowerCase()}` as keyof typeof t]} ${selectedYear}`);

      } catch (error) {
        console.error(error);
        alert('Error parsing seasonal Excel file.');
      }
    };
    reader.readAsBinaryString(file);
    // Reset input
    event.target.value = '';
  };

  const handleManualEntryOpen = (season: Season) => {
    const pattern = seasonalData[selectedYear]?.pattern;
    if (!pattern || pattern.length === 0) return;
    
    setManualEntryTarget({ year: selectedYear, season });
    // Initialize form with empty values
    const initialForm: any = {};
    pattern.forEach(key => initialForm[key] = '');
    setManualEntryForm(initialForm);
    setIsManualEntryModalOpen(true);
  };

  const handleManualEntrySave = () => {
    if (!manualEntryTarget) return;
    const { year, season } = manualEntryTarget;
    
    // Format numeric values
    const formattedEntry = { ...manualEntryForm };
    Object.keys(formattedEntry).forEach(key => {
        const num = Number(formattedEntry[key]);
        if (!isNaN(num) && formattedEntry[key].trim() !== '') {
            formattedEntry[key] = num as any;
        }
    });

    setSeasonalData(prev => {
        const newData = { ...prev };
        if (!newData[year].seasons[season]) {
            newData[year].seasons[season] = [];
        }
        newData[year].seasons[season]?.push(formattedEntry);
        return newData;
    });

    // Refresh analysis if currently viewing this season
    setActiveAnalysisData(prev => {
        if (activeAnalysisTitle.includes(season) && activeAnalysisTitle.includes(year)) {
             return [...(prev || []), formattedEntry];
        }
        return prev;
    });

    setIsManualEntryModalOpen(false);
  };

  const handleAddYear = () => {
    const nextYear = (parseInt(yearsList[yearsList.length - 1]) + 1).toString();
    setYearsList(prev => [...prev, nextYear]);
    setSelectedYear(nextYear);
    setSeasonalData(prev => ({
        ...prev,
        [nextYear]: { pattern: [], seasons: {} }
    }));
  };

  const handleAnalyzeTemplateAlignment = async () => {
    if (priorityHeaders.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeDashboardData({
        priorityFormat: priorityHeaders,
        currentAppFields: ['CourseName', 'Participants', 'Completion', 'Status', 'EmployeeName', 'Department', 'Score', 'Date']
      }, lang);
      setTemplateAnalysis(result);
    } catch (e) {
      console.error(e);
      setTemplateAnalysis(lang === 'fa' ? 'خطا در تحلیل انطباق.' : 'Alignment analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
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
    if (!hasApiKey) {
      await handleSelectApiKey();
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
         setHasApiKey(true);
      } else {
         return;
      }
    }
    setIsGeneratingCert(true);
    setGeneratedCertUrl(null);
    try {
      const url = await generateCertificate(
        selectedEmployee.name, 
        courseName, 
        systemSettings.logo, 
        systemSettings.ceoName,
        systemSettings.trainingManagerName,
        certImageSize, 
        lang
      );
      setGeneratedCertUrl(url);
    } catch (error) {
      console.error(error);
      alert('Error generating certificate.');
    } finally {
      setIsGeneratingCert(false);
    }
  };

  // Content Generation Logic
  const handleGenerateContent = async () => {
    if (!genForm.topic.trim()) return;
    
    // Key Check
    if (!hasApiKey) {
        await handleSelectApiKey();
        const key = await window.aistudio?.hasSelectedApiKey();
        if (!key) return;
        setHasApiKey(true);
    }

    setIsGeneratingContent(true);
    setGeneratedContentUrl(null);

    try {
      if (genForm.format === 'video') {
         // Veo logic
         const videoUri = await generateTrainingVideo(genForm, lang);
         setGeneratedContentUrl(videoUri);
      } else {
         // Text/PPT logic
         const content = await generateTrainingDocument(genForm, lang);
         // Create Blob
         const blob = new Blob([content], { type: 'text/markdown' });
         const url = URL.createObjectURL(blob);
         setGeneratedContentUrl(url);
      }
    } catch (error) {
       console.error(error);
       alert('Content generation failed.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const downloadGeneratedFile = async () => {
    if (!generatedContentUrl) return;
    
    if (genForm.format === 'video') {
       try {
          const apiKey = process.env.API_KEY || ''; 
          const response = await fetch(`${generatedContentUrl}&key=${apiKey}`);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${genForm.topic.replace(/\s+/g, '_')}_video.mp4`;
          a.click();
       } catch (e) {
          alert("Download failed. Check console/network.");
       }
    } else {
      const a = document.createElement('a');
      a.href = generatedContentUrl;
      a.download = `${genForm.topic.replace(/\s+/g, '_')}_${genForm.format}.md`;
      a.click();
    }
  };


  // Localization logic for charts
  const getLocalizedMonth = (month: string) => {
    if (lang === 'en') return month;
    const map: Record<string, string> = {
      'Apr': 'فروردین', 'May': 'اردیبهشت', 'Jun': 'خرداد',
      'Jul': 'تیر', 'Aug': 'مرداد', 'Sep': 'شهریور'
    };
    return map[month] || month;
  };

  const getLocalizedDept = (dept: string) => {
    if (lang === 'en') return dept;
    const map: Record<string, string> = {
      'Production': 'تولید',
      'Quality': 'کنترل کیفیت',
      'Technical': 'فنی',
      'Safety': 'ایمنی',
      'HR/Other': 'منابع انسانی'
    };
    return map[dept] || dept;
  };

  const localizedMonthlyData = MONTHLY_TRAINING_DATA.map(d => ({
    ...d,
    month: getLocalizedMonth(d.month)
  }));

  const localizedDeptData = DEPARTMENT_DATA.map(d => ({
    ...d,
    name: getLocalizedDept(d.name)
  }));

  const filteredCourses = coursesList.filter(c => {
    if (selectedCourseType === 'all') return true;
    return c.type === selectedCourseType;
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg: Message = { role: 'user', content: inputMessage };
    // Enrich with priority template if available
    let contextMessage = userMsg.content;
    if (priorityHeaders.length > 0) {
      contextMessage += `\n(User's priority report format headers: ${priorityHeaders.join(', ')})`;
    }
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    try {
      let fullResponse = '';
      const stream = streamGeminiResponse(contextMessage, messages, lang);
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
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'fa' ? 'خطا در ارتباط.' : 'Error.' }]);
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
      } catch (error: any) {
        setIsVoiceMode(false);
        alert(error.message || "Failed.");
      }
    }
  };

  const runDashboardAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeDashboardData({
        courses: coursesList,
        employees: EMPLOYEES,
        monthly: MONTHLY_TRAINING_DATA
      }, lang);
      setDashboardAnalysis(result);
    } catch (e) {
      setDashboardAnalysis(lang === 'fa' ? 'خطا.' : 'Error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`flex h-screen bg-slate-50 text-slate-800 font-sans ${isRTL ? 'font-[Vazirmatn]' : ''}`}>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)}/>
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
          <div className="mb-4 bg-slate-800 rounded-xl p-3 border border-slate-700">
             <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2 block flex items-center gap-1">
               <UserCog size={10} />
               {t.switch_role}
             </label>
             <div className="flex flex-col gap-1 bg-slate-900 rounded-lg p-1">
                <button 
                  onClick={() => setUserRole('developer')}
                  className={`w-full py-1.5 px-2 rounded-md text-[10px] font-medium transition flex items-center gap-2 ${userRole === 'developer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  <Code2 size={12}/> {t.role_developer}
                </button>
                <button 
                  onClick={() => setUserRole('factory_manager')}
                  className={`w-full py-1.5 px-2 rounded-md text-[10px] font-medium transition flex items-center gap-2 ${userRole === 'factory_manager' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  <Building2 size={12}/> {t.role_factory_manager}
                </button>
                <button 
                  onClick={() => setUserRole('training_manager')}
                  className={`w-full py-1.5 px-2 rounded-md text-[10px] font-medium transition flex items-center gap-2 ${userRole === 'training_manager' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  <HardHat size={12}/> {t.role_training_manager}
                </button>
             </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full bg-${userRole === 'developer' ? 'indigo' : userRole === 'factory_manager' ? 'amber' : 'emerald'}-500 flex items-center justify-center text-xs font-bold text-white uppercase`}>
                {userRole === 'developer' ? 'DV' : userRole === 'factory_manager' ? 'FM' : 'TM'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate text-white">
                  {userRole === 'developer' ? t.role_developer : userRole === 'factory_manager' ? t.role_factory_manager : t.role_training_manager}
                </p>
              </div>
            </div>
            <button className="w-full text-xs text-red-400 font-medium hover:text-red-300 transition">
              {t.logout}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2 font-mono opacity-60">v{APP_VERSION}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-lg text-slate-800">
              {tabsConfig.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={t.search_placeholder} className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
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
                    <button onClick={runDashboardAnalysis} disabled={isAnalyzing} className={`px-4 py-2 bg-${theme}-600 text-white rounded-lg text-sm font-medium hover:bg-${theme}-700 flex items-center gap-2`}>
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
                    <div className="prose prose-sm max-w-none text-indigo-900 whitespace-pre-wrap">{dashboardAnalysis}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t.stat_active_courses, value: coursesList.length, icon: BookOpen, color: 'blue' },
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
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">{t.chart_monthly}</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={localizedMonthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                           contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                           cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="participants" fill={`#3b82f6`} radius={[4, 4, 0, 0]} barSize={40} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">{t.chart_dist}</h3>
                    <ResponsiveContainer width="100%" height="100%">
                       <RechartsPieChart>
                          <Pie
                             data={localizedDeptData}
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             {localizedDeptData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                       </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Courses View */}
            {activeTab === Tab.Courses && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-visible">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.course_manage_title}</h3>
                    <p className="text-sm text-slate-500">{t.course_manage_subtitle}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                      {['all', 'internal', 'external'].map(type => (
                        <button key={type} onClick={() => setSelectedCourseType(type as any)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedCourseType === type ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                          {type === 'all' ? t.filter_type_all : type === 'internal' ? t.filter_type_internal : t.filter_type_external}
                        </button>
                      ))}
                    </div>
                    {canEditContent && (
                      <button onClick={() => openCourseModal()} className={`bg-${theme}-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-${theme}-700 flex items-center gap-2`}>
                        <Plus size={16} /> {t.btn_new_course}
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-visible">
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
                      {filteredCourses.map(course => (
                        <tr key={course.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                               <span className="font-medium text-slate-900">{course.name}</span>
                               <span className="text-[10px] text-slate-400 mt-0.5 inline-flex items-center gap-1">
                                 {course.type === 'internal' ? <Building2 size={10} /> : <Globe size={10} />}
                                 {course.type === 'internal' ? t.filter_type_internal : t.filter_type_external}
                               </span>
                             </div>
                          </td>
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
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${course.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              <CheckCircle size={12} /> {course.status === 'active' ? t.filter_active : t.filter_completed}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            {canEditContent && (
                              <button onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === course.id ? null : course.id); }} className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100 transition">
                                <MoreVertical size={18} />
                              </button>
                            )}
                            {openActionMenuId === course.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenActionMenuId(null)}></div>
                                <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden origin-top-left">
                                  <button onClick={() => openCourseModal(course)} className="w-full text-right px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <Edit size={14} className="text-blue-500" /> {t.btn_edit_course}
                                  </button>
                                  <button onClick={() => handleDeleteCourse(course.id)} className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <Trash size={14} /> {lang === 'fa' ? 'حذف' : 'Delete'}
                                  </button>
                                </div>
                              </>
                            )}
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
              <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[400px]">
                 <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                   <div className="text-center md:text-right flex-1">
                     <h3 className="text-xl font-bold text-slate-900">{t.emp_title}</h3>
                     <p className="text-slate-500 text-sm mt-1">{t.emp_subtitle}</p>
                   </div>
                   <div className="flex gap-2">
                      {canEditContent && (
                        <label className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 transition shadow-sm`}>
                          <Users size={18} /> <span className="text-sm font-medium">{t.btn_import_excel}</span>
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                        </label>
                      )}
                      {canEditContent && (
                         <label className={`flex items-center gap-2 px-4 py-2.5 bg-${theme}-600 text-white rounded-xl cursor-pointer hover:bg-${theme}-700 transition shadow-lg`}>
                           <History size={18} /> <span className="text-sm font-medium">{t.btn_import_history}</span>
                           <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleHistoryUpload} />
                         </label>
                      )}
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employeesList.map(emp => (
                      <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className="p-5 border border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition bg-white cursor-pointer group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition">{emp.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">{emp.department}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 transition">
                            <GraduationCap size={20} />
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
                          <span className="text-slate-500">{t.emp_card_courses}</span>
                          <span className="font-bold text-slate-900">{emp.coursesCompleted}</span>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Reports View */}
            {activeTab === Tab.Reports && (
              <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* Seasonal Statistics Section */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                     <div className="flex items-center gap-3">
                       <div className={`p-2 bg-indigo-100 text-indigo-600 rounded-lg`}>
                         <Archive className="w-6 h-6" />
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-slate-900">{t.seasonal_title}</h3>
                         <p className="text-sm text-slate-500">{t.seasonal_subtitle}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="relative">
                          <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            {yearsList.map(year => <option key={year} value={year}>{lang === 'fa' ? `سال ${year}` : `FY ${year}`}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {canEditContent && (
                          <button onClick={handleAddYear} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition">
                             <Plus size={16} /> {t.btn_add_year}
                          </button>
                        )}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {(['Spring', 'Summer', 'Fall', 'Winter'] as Season[]).map((season) => {
                      const hasData = seasonalData[selectedYear]?.seasons[season]?.length > 0;
                      const hasPattern = seasonalData[selectedYear]?.pattern?.length > 0;
                      
                      return (
                        <div key={season} className={`border rounded-xl p-4 transition-all ${hasData ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-200 border-dashed'}`}>
                           <div className="flex items-center justify-between mb-4">
                              <span className={`font-bold ${hasData ? 'text-indigo-700' : 'text-slate-500'}`}>{t[`season_${season.toLowerCase()}` as keyof typeof t]}</span>
                              {hasData ? <CheckCircle size={18} className="text-indigo-500" /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                           </div>
                           
                           {hasData ? (
                             <div className="space-y-2">
                               <button 
                                 onClick={() => {
                                    setActiveAnalysisData(seasonalData[selectedYear].seasons[season]);
                                    setActiveAnalysisTitle(`${t[`season_${season.toLowerCase()}` as keyof typeof t]} ${selectedYear}`);
                                 }}
                                 className="w-full py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-50 transition"
                               >
                                 {t.btn_view_analysis}
                               </button>
                               {canEditContent && (
                                 <label className="block w-full text-center py-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                                    {lang === 'fa' ? 'بروزرسانی' : 'Update'}
                                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleSeasonalUpload(e, season)} />
                                 </label>
                               )}
                             </div>
                           ) : (
                             <div className="space-y-2">
                               {canEditContent && (
                                 <>
                                   <label className="flex items-center justify-center gap-2 w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition cursor-pointer">
                                      <Upload size={14} /> {t.btn_upload_excel}
                                      <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleSeasonalUpload(e, season)} />
                                   </label>
                                   <button 
                                     onClick={() => handleManualEntryOpen(season)}
                                     disabled={!hasPattern}
                                     className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                   >
                                     {t.btn_manual_entry}
                                   </button>
                                 </>
                               )}
                               {!canEditContent && (
                                 <p className="text-xs text-center text-slate-400 py-2">{t.no_data}</p>
                               )}
                             </div>
                           )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {activeAnalysisData && (
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
                       <div className="flex items-center justify-between mb-6">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2">
                             <TrendingUp size={20} className="text-blue-600" /> 
                             {t.data_analysis_title}: <span className="text-blue-700">{activeAnalysisTitle}</span>
                          </h4>
                          <button onClick={() => setActiveAnalysisData(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                       </div>
                       
                       {/* Auto-Generated Charts */}
                       <div className="grid lg:grid-cols-2 gap-6 mb-8">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-80">
                             <h5 className="text-sm font-bold text-slate-600 mb-4">{t.charts_title}</h5>
                             <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={activeAnalysisData.slice(0, 10)}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                  <XAxis dataKey={Object.keys(activeAnalysisData[0])[0]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                  <Legend />
                                  {/* Try to find first numeric data key */}
                                  {Object.keys(activeAnalysisData[0]).slice(1, 4).map((key, idx) => {
                                      const isNumeric = typeof activeAnalysisData[0][key] === 'number';
                                      if (!isNumeric) return null;
                                      return <Bar key={key} dataKey={key} fill={['#3b82f6', '#10b981', '#f59e0b'][idx % 3]} radius={[4, 4, 0, 0]} />;
                                  })}
                                </RechartsBarChart>
                             </ResponsiveContainer>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                             <h5 className="text-sm font-bold text-slate-600 mb-4">{t.data_table_title}</h5>
                             <div className="flex-1 overflow-auto">
                                <table className="w-full text-xs text-left">
                                   <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                                      <tr>
                                         {Object.keys(activeAnalysisData[0]).map(key => <th key={key} className="px-3 py-2 whitespace-nowrap">{key}</th>)}
                                      </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100">
                                      {activeAnalysisData.map((row, i) => (
                                         <tr key={i} className="hover:bg-slate-50">
                                            {Object.values(row).map((val: any, j) => (
                                               <td key={j} className="px-3 py-2 whitespace-nowrap text-slate-700">{val}</td>
                                            ))}
                                         </tr>
                                      ))}
                                   </tbody>
                                </table>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                {/* Priority Format Definition Section (Legacy/Specific Request) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-amber-100 text-amber-600 rounded-lg`}>
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{t.report_past_title}</h3>
                          <p className="text-sm text-slate-500">{t.report_past_desc}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {priorityHeaders.length > 0 && (
                          <button 
                            onClick={handleAnalyzeTemplateAlignment}
                            disabled={isAnalyzing}
                            className={`flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition disabled:opacity-50`}
                          >
                            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                            <span className="text-sm font-medium">{t.btn_analyze_template}</span>
                          </button>
                        )}
                        {canEditContent && (
                          <label className={`flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl cursor-pointer hover:bg-amber-700 transition shadow-lg shadow-amber-500/20`}>
                            <FileSpreadsheet size={18} />
                            <span className="text-sm font-medium">{t.report_select_file}</span>
                            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handlePastReportUpload} />
                          </label>
                        )}
                      </div>
                   </div>

                   {templateAnalysis && (
                     <div className="mb-6 bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 mb-3 text-amber-400">
                           <Bot size={20} />
                           <h4 className="font-bold">AI Format Analysis</h4>
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">
                           {templateAnalysis}
                        </div>
                     </div>
                   )}
                   
                   {priorityHeaders.length > 0 ? (
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 w-fit">
                           <CheckCircle size={14} />
                           {t.report_status_defined}: <span className="font-mono text-slate-900">{pastReportFileName}</span>
                        </div>
                        <div className="border rounded-xl overflow-hidden bg-slate-50">
                           <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.report_data_preview}</span>
                              <div className="flex gap-1">
                                {priorityHeaders.map((h, i) => (
                                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{h}</span>
                                ))}
                              </div>
                           </div>
                           <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-200">
                                  <tr>
                                    {priorityHeaders.map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  {pastReportData.slice(0, 3).map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-50">
                                      {priorityHeaders.map((h) => <td key={h} className="px-4 py-2 text-slate-500">{row[h] || '-'}</td>)}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-400 max-w-xs text-center">هنوز هیچ قالب اولویتی بارگذاری نشده است.</p>
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* AI View */}
            {activeTab === Tab.AI && (
              <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg"><Bot className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900">{t.ai_title}</h3>
                      <p className="text-xs text-slate-500">{t.ai_subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
                    <button onClick={() => setAiMode('chat')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1 ${aiMode === 'chat' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}>
                      <MessageSquare size={14}/> {t.ai_mode_chat}
                    </button>
                    <button onClick={() => setAiMode('studio')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1 ${aiMode === 'studio' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}>
                      <Clapperboard size={14}/> {t.ai_mode_studio}
                    </button>
                  </div>

                  {aiMode === 'chat' && (
                    <button onClick={toggleVoiceMode} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isVoiceMode ? 'bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                      {isVoiceMode ? <><MicOff size={14} /> {t.btn_stop_voice}</> : <><Mic size={14} /> {t.btn_voice_mode}</>}
                    </button>
                  )}
                </div>

                {/* AI Chat Mode */}
                {aiMode === 'chat' && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                      {messages.length === 0 && (
                        <div className="text-center py-12 px-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-200"><Bot className="w-8 h-8 text-white" /></div>
                          <h2 className="text-xl font-bold text-slate-900 mb-2">{t.ai_welcome_title}</h2>
                          <p className="text-slate-500 max-w-md mx-auto">{t.ai_welcome_desc}</p>
                        </div>
                      )}
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? `bg-${theme}-600 text-white rounded-br-none` : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef}></div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                      <div className="flex gap-2 relative">
                        <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isVoiceMode ? t.listening : t.input_placeholder} disabled={isVoiceMode || isTyping} className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"/>
                        <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isVoiceMode || isTyping} className={`p-3 rounded-xl bg-${theme}-600 text-white hover:bg-${theme}-700 disabled:opacity-50 transition-colors`}>
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* AI Content Studio Mode */}
                {aiMode === 'studio' && (
                  <div className="flex flex-col h-full bg-slate-50/30">
                    <div className="p-8 max-w-2xl mx-auto w-full flex-1 overflow-y-auto">
                        <div className="text-center mb-8">
                           <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-indigo-600"><Wand2 size={24}/></div>
                           <h3 className="text-xl font-bold text-slate-900">{t.studio_title}</h3>
                           <p className="text-sm text-slate-500">{t.studio_desc}</p>
                        </div>

                        <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">{t.field_topic}</label>
                              <input 
                                type="text" 
                                value={genForm.topic} 
                                onChange={(e) => setGenForm(prev => ({...prev, topic: e.target.value}))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                              />
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-2">{t.field_audience}</label>
                                 <input 
                                   type="text" 
                                   value={genForm.targetAudience} 
                                   onChange={(e) => setGenForm(prev => ({...prev, targetAudience: e.target.value}))}
                                   className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-2">{t.field_format}</label>
                                 <div className="relative">
                                    <select 
                                       value={genForm.format}
                                       onChange={(e) => setGenForm(prev => ({...prev, format: e.target.value as ContentFormat}))}
                                       className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white"
                                    >
                                       <option value="video">{t.format_video}</option>
                                       <option value="pamphlet">{t.format_pamphlet}</option>
                                       <option value="powerpoint">{t.format_ppt}</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                 </div>
                              </div>
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">{t.field_description}</label>
                              <textarea 
                                rows={4}
                                value={genForm.description}
                                onChange={(e) => setGenForm(prev => ({...prev, description: e.target.value}))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none"
                              ></textarea>
                           </div>

                           <button 
                             onClick={handleGenerateContent}
                             disabled={isGeneratingContent || !genForm.topic}
                             className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                           >
                             {isGeneratingContent ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                             {isGeneratingContent ? t.generating_content : t.btn_generate_content}
                           </button>

                           {generatedContentUrl && (
                             <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                   <div className="bg-white p-2 rounded-lg border border-emerald-100 text-emerald-600">
                                      {genForm.format === 'video' ? <Video size={20}/> : genForm.format === 'pamphlet' ? <FileType size={20}/> : <Presentation size={20}/>}
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-emerald-800 text-sm">{t.download_content}</h4>
                                      <p className="text-xs text-emerald-600">{genForm.format.toUpperCase()} Generated</p>
                                   </div>
                                </div>
                                <button onClick={downloadGeneratedFile} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
                                   <Download size={14} /> Download
                                </button>
                             </div>
                           )}
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Settings */}
             {activeTab === Tab.Settings && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                 <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Settings size={24} /> {t.settings_title}</h3>
                 <div className="grid gap-8 max-w-2xl">
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2"><Building2 size={16} /> {t.settings_org_info}</h4>
                      <div className="grid gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-2">{t.settings_company_name}</label><input type="text" value={systemSettings.companyName} onChange={(e) => handleSettingsChange('companyName', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none disabled:bg-slate-100 disabled:text-slate-500" disabled={!canEditSettings}/></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-medium text-slate-700 mb-2">{t.settings_ceo_name}</label><input type="text" value={systemSettings.ceoName} onChange={(e) => handleSettingsChange('ceoName', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none disabled:bg-slate-100 disabled:text-slate-500" disabled={!canEditSettings}/></div>
                           <div><label className="block text-sm font-medium text-slate-700 mb-2">{t.settings_manager_name}</label><input type="text" value={systemSettings.trainingManagerName} onChange={(e) => handleSettingsChange('trainingManagerName', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none disabled:bg-slate-100 disabled:text-slate-500" disabled={!canEditSettings}/></div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-2">{t.settings_logo}</label>
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden">{systemSettings.logo ? <img src={systemSettings.logo} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-400" size={24} />}</div>
                              {canEditSettings && <label className="cursor-pointer bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"><Upload size={16} /> {t.btn_upload_logo}<input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} /></label>}
                           </div>
                        </div>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                     <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2"><UserCog size={16} /> {t.settings_theme}</h4>
                     <div className="grid gap-4">
                       <div><label className="block text-sm font-medium text-slate-700 mb-2">{t.lang_select}</label><div className="flex gap-2">{['fa', 'en'].map(l => <button key={l} onClick={() => setLang(l as any)} className={`px-4 py-2 rounded-lg border text-sm ${lang === l ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-slate-200 text-slate-600'}`}>{l === 'fa' ? 'فارسی' : 'English'}</button>)}</div></div>
                       <div><label className="block text-sm font-medium text-slate-700 mb-2">{t.theme_select}</label><div className="flex gap-3">{['blue', 'emerald', 'violet', 'rose', 'amber'].map((c) => <button key={c} onClick={() => setTheme(c as ThemeColor)} className={`w-8 h-8 rounded-full bg-${c}-500 ring-offset-2 transition-transform hover:scale-110 ${theme === c ? 'ring-2 ring-slate-400 scale-110' : ''}`} />)}</div></div>
                     </div>
                   </div>
                   {canEditSettings && (
                     <div className="flex gap-3 pt-4 items-center">
                        <div className={`flex items-center gap-2 text-${theme}-600 bg-${theme}-50 px-4 py-2 rounded-lg transition-all duration-500 ease-in-out ${showSaveIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}><CheckCircle size={18} /> <span className="text-sm font-medium">{lang === 'fa' ? 'تغییرات به صورت خودکار ذخیره شد' : 'Changes saved automatically'}</span></div>
                     </div>
                   )}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal for New/Edit Course */}
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCourseModalOpen(false)}></div>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-slate-900">{editingCourseId ? t.btn_edit_course : t.btn_new_course}</h3>
                 <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
               </div>
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">{t.col_course_name}</label>
                   <input type="text" value={courseForm.name} onChange={(e) => setCourseForm({...courseForm, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={lang === 'fa' ? 'مثال: ایمنی کار در ارتفاع' : 'e.g. Safety at Heights'}/>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{t.filter_type_label}</label>
                      <select value={courseForm.type} onChange={(e) => setCourseForm({...courseForm, type: e.target.value as any})} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none">
                         <option value="internal">{t.filter_type_internal}</option>
                         <option value="external">{t.filter_type_external}</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{t.col_status}</label>
                      <select value={courseForm.status} onChange={(e) => setCourseForm({...courseForm, status: e.target.value as any})} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none">
                         <option value="active">{t.filter_active}</option>
                         <option value="completed">{t.filter_completed}</option>
                      </select>
                   </div>
                 </div>

                 {/* Progress Slider */}
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                       <span>{t.field_progress}</span>
                       <span className={`text-${theme}-600 font-bold`}>{courseForm.completion}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={courseForm.completion} 
                      onChange={(e) => setCourseForm({...courseForm, completion: parseInt(e.target.value)})}
                      className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${theme}-600`}
                    />
                 </div>

                 <div className="flex gap-3 pt-2">
                   <button onClick={() => setIsCourseModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition">{t.btn_cancel}</button>
                   <button onClick={handleSaveCourse} disabled={!courseForm.name.trim()} className={`flex-1 py-3 rounded-xl bg-${theme}-600 text-white font-medium hover:bg-${theme}-700 transition disabled:opacity-50`}>{editingCourseId ? t.save_changes : (lang === 'fa' ? 'ذخیره دوره' : 'Save Course')}</button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Modal for Employee Details & Certificate */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setSelectedEmployee(null); setGeneratedCertUrl(null); }}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-0 relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div className="flex items-center gap-4"><div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><Users size={28} /></div><div><h3 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h3><p className="text-slate-500 text-sm">{selectedEmployee.department}</p></div></div>
                  <button onClick={() => { setSelectedEmployee(null); setGeneratedCertUrl(null); }} className="text-slate-400 hover:text-slate-600 transition"><X size={24} /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6">
                 {generatedCertUrl ? (
                   <div className="flex flex-col items-center">
                     <h4 className="font-bold text-lg mb-4 text-emerald-600 flex items-center gap-2"><CheckCircle size={20} /> {t.cert_modal_title}</h4>
                     <div className="w-full max-w-2xl bg-slate-100 p-2 rounded-xl shadow-inner mb-6"><img src={generatedCertUrl} alt="Certificate" className="w-full h-auto rounded-lg shadow-md" /></div>
                     <button onClick={() => setGeneratedCertUrl(null)} className="text-sm text-slate-500 hover:text-slate-800 underline">{lang === 'fa' ? 'بازگشت به لیست' : 'Back to list'}</button>
                   </div>
                 ) : (
                   <>
                     <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Award className="text-blue-600" size={20} /><h4 className="font-bold text-slate-800">{t.emp_history_title}</h4></div><div className="flex items-center gap-3">{!hasApiKey && <button onClick={handleSelectApiKey} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100"><KeyRound size={12} /> {t.cert_select_api}</button>}<div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200"><span className="text-[10px] text-slate-500 pl-2">{t.cert_quality_label}</span>{(['1K', '2K', '4K'] as const).map(size => <button key={size} onClick={() => setCertImageSize(size)} className={`px-2 py-1 rounded text-[10px] font-bold transition ${certImageSize === size ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>{size}</button>)}</div></div></div>
                     <div className="overflow-hidden rounded-xl border border-slate-200">
                       <table className="w-full text-sm">
                         <thead className="bg-slate-50 text-slate-500 font-medium"><tr><th className="px-4 py-3 text-right">{t.emp_col_course}</th><th className="px-4 py-3">{t.emp_col_date}</th><th className="px-4 py-3">{t.emp_col_score}</th><th className="px-4 py-3 text-center">{t.emp_col_cert}</th></tr></thead>
                         <tbody className="divide-y divide-slate-100">
                           {selectedEmployee.completedCoursesList.map((course) => (
                             <tr key={course.id} className="hover:bg-slate-50/50">
                               <td className="px-4 py-3 font-medium text-slate-800">{course.name}</td><td className="px-4 py-3 text-slate-600">{course.date}</td><td className="px-4 py-3 text-slate-600"><span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${course.score >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{course.score}</span></td><td className="px-4 py-3 text-center"><button onClick={() => handleGenerateCertificate(course.name)} disabled={isGeneratingCert} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 mx-auto disabled:opacity-50">{isGeneratingCert ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}{isGeneratingCert ? t.cert_generating : t.btn_generate_cert}</button></td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* Modal for Manual Data Entry */}
        {isManualEntryModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsManualEntryModalOpen(false)}></div>
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h3 className="text-lg font-bold text-slate-900">
                    {t.enter_data_for} {t[`season_${manualEntryTarget?.season.toLowerCase()}` as keyof typeof t] || ''} {manualEntryTarget?.year}
                  </h3>
                  <button onClick={() => setIsManualEntryModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto pr-2 flex-1">
                   <div className="grid gap-4">
                      {seasonalData[selectedYear]?.pattern?.map(key => (
                         <div key={key}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{key}</label>
                            <input 
                               type="text" 
                               value={manualEntryForm[key] || ''}
                               onChange={(e) => setManualEntryForm(prev => ({...prev, [key]: e.target.value}))}
                               className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                         </div>
                      ))}
                   </div>
                </div>
                <div className="pt-6 mt-4 border-t border-slate-100 flex gap-3 shrink-0">
                   <button onClick={() => setIsManualEntryModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition">{t.btn_cancel}</button>
                   <button onClick={handleManualEntrySave} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">{t.save_data}</button>
                </div>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;