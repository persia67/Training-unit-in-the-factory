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
  Line
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
  Code2,
  DollarSign,
  Clock,
  Briefcase,
  Layers
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
  
  // Reporting State
  const [selectedYear, setSelectedYear] = useState<string>('1403');
  const [yearsList, setYearsList] = useState<string[]>(['1403']);
  const [activeReportSubTab, setActiveReportSubTab] = useState<'courses' | 'units' | 'consolidated'>('courses');

  // Report 1: Quarterly Course Performance (General/Aggregate)
  // We reuse DepartmentalData structure but use a special key 'General' for the aggregate rows
  const [generalCourseReports, setGeneralCourseReports] = useState<DepartmentalData>({});
  
  // Report 3: Unit Performance Reports (Detailed per unit)
  const [unitReports, setUnitReports] = useState<DepartmentalData>({});
  const [selectedUnitName, setSelectedUnitName] = useState<string>(ORGANIZATIONAL_UNITS[0]);

  const [selectedDeptSeason, setSelectedDeptSeason] = useState<Season>('Spring');
  const [newRowData, setNewRowData] = useState<Partial<DepartmentReportRow>>({
    courseName: '', participants: 0, costPerPerson: 0, durationHours: 0, location: ''
  });

  // Report 2: Consolidated Reporting (Org Chart Summary)
  const [consolidatedReports, setConsolidatedReports] = useState<ConsolidatedReportData>({});
  const [consolidatedChartMetric, setConsolidatedChartMetric] = useState<'personHours' | 'totalCost' | 'totalPersonnel'>('personPersonnel');

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
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

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

  const handleAddYear = () => {
    const nextYear = (parseInt(yearsList[yearsList.length - 1]) + 1).toString();
    setYearsList(prev => [...prev, nextYear]);
    setSelectedYear(nextYear);
  };

  // Generic Function to add rows to ANY report (General or Unit-Specific)
  const addReportRow = (
      targetStateSetter: React.Dispatch<React.SetStateAction<DepartmentalData>>,
      targetKey: string // 'General' or UnitName
  ) => {
    if (!newRowData.courseName) return;

    targetStateSetter(prev => {
      const yearData = prev[selectedYear] || {};
      const seasonData = yearData[selectedDeptSeason] || {};
      const targetRows = seasonData[targetKey] || [];

      const participants = Number(newRowData.participants) || 0;
      const costPerPerson = Number(newRowData.costPerPerson) || 0;
      const hours = Number(newRowData.durationHours) || 0;

      const newRow: DepartmentReportRow = {
        id: Date.now(),
        courseName: newRowData.courseName || '-',
        participants: participants,
        costPerPerson: costPerPerson,
        durationHours: hours,
        location: newRowData.location || '-',
        totalCost: participants * costPerPerson,
        personHours: participants * hours
      };

      return {
        ...prev,
        [selectedYear]: {
          ...yearData,
          [selectedDeptSeason]: {
            ...seasonData,
            [targetKey]: [...targetRows, newRow]
          }
        }
      };
    });

    setNewRowData({ courseName: '', participants: 0, costPerPerson: 0, durationHours: 0, location: '' });
  };

  // Generic delete row
  const deleteReportRow = (
      targetStateSetter: React.Dispatch<React.SetStateAction<DepartmentalData>>,
      targetKey: string,
      id: number
  ) => {
    targetStateSetter(prev => {
      const yearData = prev[selectedYear];
      if (!yearData) return prev;
      const seasonData = yearData[selectedDeptSeason];
      if (!seasonData) return prev;
      const targetRows = seasonData[targetKey];
      if (!targetRows) return prev;

      return {
        ...prev,
        [selectedYear]: {
          ...yearData,
          [selectedDeptSeason]: {
            ...seasonData,
            [targetKey]: targetRows.filter(row => row.id !== id)
          }
        }
      };
    });
  };

  // Sync Logic: Sum Unit Reports into General Report
  const handleSyncFromUnits = () => {
      const currentSeasonUnits = unitReports[selectedYear]?.[selectedDeptSeason];
      if (!currentSeasonUnits) {
          alert("No unit data to sync for this season.");
          return;
      }

      const aggregated: Record<string, DepartmentReportRow> = {};

      Object.values(currentSeasonUnits).forEach(rows => {
          rows.forEach(row => {
              if (aggregated[row.courseName]) {
                  aggregated[row.courseName].participants += row.participants;
                  aggregated[row.courseName].totalCost += row.totalCost;
                  // Cost per person should ideally be same, but we can average or keep existing
                  aggregated[row.courseName].personHours += row.personHours;
              } else {
                  aggregated[row.courseName] = { ...row, id: Date.now() + Math.random() };
              }
          });
      });

      const newGeneralRows = Object.values(aggregated);
      
      setGeneralCourseReports(prev => ({
          ...prev,
          [selectedYear]: {
              ...(prev[selectedYear] || {}),
              [selectedDeptSeason]: {
                  ...(prev[selectedYear]?.[selectedDeptSeason] || {}),
                  'General': newGeneralRows
              }
          }
      }));
      alert(lang === 'fa' ? "تجمیع داده‌ها با موفقیت انجام شد." : "Data synchronized successfully.");
  };

  // Report 2 Logic: Consolidated Reporting
  const updateConsolidatedItem = (unit: string, field: keyof ConsolidatedReportItem, value: number) => {
    setConsolidatedReports(prev => {
      const yearData = prev[selectedYear] || {};
      const seasonData = yearData[selectedDeptSeason] || [];
      
      const existingItemIndex = seasonData.findIndex(item => item.unitName === unit);
      let newSeasonData = [...seasonData];

      if (existingItemIndex > -1) {
        const item = newSeasonData[existingItemIndex];
        const updatedItem = { ...item, [field]: value };
        if (field === 'totalHours' || field === 'totalPersonnel') {
            updatedItem.personHours = (field === 'totalHours' ? value : item.totalHours) * (field === 'totalPersonnel' ? value : item.totalPersonnel);
        }
        newSeasonData[existingItemIndex] = updatedItem;
      } else {
        const newItem: ConsolidatedReportItem = {
            id: Date.now() + Math.random(),
            unitName: unit,
            totalHours: 0,
            totalCost: 0,
            totalPersonnel: 0,
            personHours: 0
        };
        (newItem as any)[field] = value;
         if (field === 'totalHours' || field === 'totalPersonnel') {
            newItem.personHours = newItem.totalHours * newItem.totalPersonnel;
        }
        newSeasonData.push(newItem);
      }

      return {
        ...prev,
        [selectedYear]: {
            ...yearData,
            [selectedDeptSeason]: newSeasonData
        }
      };
    });
  };

  const getConsolidatedDataForChart = () => {
    const seasonData = consolidatedReports[selectedYear]?.[selectedDeptSeason] || [];
    return ORGANIZATIONAL_UNITS.map(unit => {
        const item = seasonData.find(i => i.unitName === unit);
        return {
            name: unit,
            value: item ? (consolidatedChartMetric === 'totalCost' ? item.totalCost : consolidatedChartMetric === 'personHours' ? item.personHours : item.totalPersonnel) : 0
        };
    }).filter(d => d.value > 0);
  };
  
  // Data for Report 1
  const currentCoursesRows = generalCourseReports[selectedYear]?.[selectedDeptSeason]?.['General'] || [];
  const totalCostSum = currentCoursesRows.reduce((acc, r) => acc + r.totalCost, 0);
  const totalPersonHoursSum = currentCoursesRows.reduce((acc, r) => acc + r.personHours, 0);

  // Data for Course Performance Chart (Report 1)
  const getCoursePerformanceData = () => {
     return currentCoursesRows.map((row, idx) => ({
        name: idx + 1,
        course: row.courseName,
        participants: row.participants,
        hours: row.durationHours,
        totalCost: row.totalCost
     }));
  };
  
  const coursePerformanceData = getCoursePerformanceData();

  // Data for Unit History Chart (Report 3)
  const getUnitHistoryData = () => {
      const seasons: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];
      return seasons.map(s => {
          const rows = unitReports[selectedYear]?.[s]?.[selectedUnitName] || [];
          const totalPH = rows.reduce((acc, r) => acc + r.personHours, 0);
          return {
              name: t[`season_${s.toLowerCase()}` as keyof typeof t] || s,
              personHours: totalPH
          };
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
               <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900">{t.course_manage_title}</h2>
                        <p className="text-slate-500 text-sm mt-1">{t.course_manage_subtitle}</p>
                     </div>
                     {canEditContent && (
                        <button onClick={() => openCourseModal()} className={`px-4 py-2 bg-${theme}-600 text-white rounded-lg text-sm font-medium hover:bg-${theme}-700 flex items-center gap-2`}>
                           <Plus size={16} /> {t.btn_new_course}
                        </button>
                     )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                     <div className="p-4 border-b border-slate-100 flex items-center gap-4 overflow-x-auto">
                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{t.filter_type_label}</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                           <button onClick={() => setSelectedCourseType('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedCourseType === 'all' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t.filter_type_all}</button>
                           <button onClick={() => setSelectedCourseType('internal')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedCourseType === 'internal' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t.filter_type_internal}</button>
                           <button onClick={() => setSelectedCourseType('external')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedCourseType === 'external' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t.filter_type_external}</button>
                        </div>
                     </div>
                     
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-slate-500 font-medium">
                              <tr>
                                 <th className="px-6 py-4">{t.col_course_name}</th>
                                 <th className="px-6 py-4">{t.col_participants}</th>
                                 <th className="px-6 py-4">{t.col_progress}</th>
                                 <th className="px-6 py-4">{t.col_status}</th>
                                 {canEditContent && <th className="px-6 py-4 text-right">{t.col_actions}</th>}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {filteredCourses.map(course => (
                                 <tr key={course.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg ${course.type === 'internal' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                             <BookOpen size={18} />
                                          </div>
                                          <div>
                                             <div className="font-medium text-slate-900">{course.name}</div>
                                             <div className="text-xs text-slate-500 capitalize">{course.type}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-2">
                                          <Users size={14} className="text-slate-400" />
                                          <span className="text-slate-600">{course.participants}</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 w-48">
                                       <div className="flex items-center gap-2">
                                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                             <div className={`h-full rounded-full ${course.completion === 100 ? 'bg-emerald-500' : `bg-${theme}-500`}`} style={{ width: `${course.completion}%` }}></div>
                                          </div>
                                          <span className="text-xs font-medium text-slate-600 w-8">{course.completion}%</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                          {course.status === 'active' ? t.filter_active : t.filter_completed}
                                       </span>
                                    </td>
                                    {canEditContent && (
                                       <td className="px-6 py-4 text-right relative">
                                          <button onClick={() => setOpenActionMenuId(openActionMenuId === course.id ? null : course.id)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                                             <MoreVertical size={16} />
                                          </button>
                                          {openActionMenuId === course.id && (
                                             <div className={`absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-10 overflow-hidden ${isRTL ? 'left-6 right-auto' : 'right-6'}`}>
                                                <button onClick={() => openCourseModal(course)} className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"><Edit size={12}/> {t.btn_edit_course}</button>
                                                <button onClick={() => handleDeleteCourse(course.id)} className="w-full px-4 py-2 text-left text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash size={12}/> Delete</button>
                                             </div>
                                          )}
                                       </td>
                                    )}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {/* Employees View */}
            {activeTab === Tab.Employees && (
               <div className="space-y-6">
                  {!selectedEmployee ? (
                     <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div>
                              <h2 className="text-2xl font-bold text-slate-900">{t.emp_title}</h2>
                              <p className="text-slate-500 text-sm mt-1">{t.emp_subtitle}</p>
                           </div>
                           <div className="flex gap-2">
                              {canEditContent && (
                                 <>
                                    <label className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer flex items-center gap-2">
                                       <Upload size={16} /> {t.btn_import_excel}
                                       <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                                    </label>
                                    <label className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 cursor-pointer flex items-center gap-2">
                                       <History size={16} /> {t.btn_import_history}
                                       <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleHistoryUpload} />
                                    </label>
                                 </>
                              )}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                           {employeesList.map(emp => (
                              <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group">
                                 <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition">
                                       {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                       <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition">{emp.name}</h3>
                                       <p className="text-xs text-slate-500">{emp.department}</p>
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                       <span className="text-slate-500">{t.emp_card_courses}</span>
                                       <span className="font-medium text-slate-900">{emp.coursesCompleted}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                       <span className="text-slate-500">Last Training:</span>
                                       <span className="font-medium text-slate-900">{emp.lastTraining}</span>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </>
                  ) : (
                     <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[600px]">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                           <button onClick={() => {setSelectedEmployee(null); setGeneratedCertUrl(null);}} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronRight className={isRTL ? "" : "rotate-180"} /></button>
                           <div>
                              <h2 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h2>
                              <p className="text-sm text-slate-500">{selectedEmployee.department} • ID: {selectedEmployee.id}</p>
                           </div>
                        </div>
                        
                        <div className="p-6 grid lg:grid-cols-3 gap-8">
                           <div className="lg:col-span-2 space-y-6">
                              <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={20}/> {t.emp_history_title}</h3>
                              <div className="border rounded-xl overflow-hidden">
                                 <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                       <tr>
                                          <th className="px-4 py-3">{t.emp_col_course}</th>
                                          <th className="px-4 py-3">{t.emp_col_date}</th>
                                          <th className="px-4 py-3">{t.emp_col_score}</th>
                                          <th className="px-4 py-3 text-right">{t.emp_col_cert}</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                       {selectedEmployee.completedCoursesList.map(c => (
                                          <tr key={c.id}>
                                             <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                                             <td className="px-4 py-3 text-slate-600">{c.date}</td>
                                             <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.score >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.score}</span>
                                             </td>
                                             <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleGenerateCertificate(c.name)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 justify-end ml-auto">
                                                   <Award size={14} /> {t.btn_generate_cert}
                                                </button>
                                             </td>
                                          </tr>
                                       ))}
                                       {selectedEmployee.completedCoursesList.length === 0 && (
                                          <tr><td colSpan={4} className="p-4 text-center text-slate-400 italic">No history available</td></tr>
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           </div>

                           <div className="bg-slate-50 rounded-xl p-6 h-fit">
                              <h3 className="font-bold text-slate-800 mb-4">{t.cert_modal_title}</h3>
                              <div className="mb-4">
                                 <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t.cert_quality_label}</label>
                                 <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                                    {(['1K', '2K', '4K'] as ImageSize[]).map(s => (
                                       <button key={s} onClick={() => setCertImageSize(s)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${certImageSize === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}>{s}</button>
                                    ))}
                                 </div>
                              </div>
                              {!hasApiKey && (
                                 <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                                    API Key required for high-quality generation.
                                    <button onClick={handleSelectApiKey} className="block mt-2 font-bold underline">{t.cert_select_api}</button>
                                 </div>
                              )}
                              
                              <div className="aspect-[4/3] bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center relative overflow-hidden group">
                                 {isGeneratingCert ? (
                                    <div className="text-center p-4">
                                       <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                                       <p className="text-xs text-indigo-600 font-medium">{t.cert_generating}</p>
                                    </div>
                                 ) : generatedCertUrl ? (
                                    <>
                                       <img src={generatedCertUrl} alt="Certificate" className="w-full h-full object-contain" />
                                       <a href={generatedCertUrl} download={`Certificate_${selectedEmployee.name}.png`} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold gap-2">
                                          <Download size={20} /> Download
                                       </a>
                                    </>
                                 ) : (
                                    <div className="text-center text-slate-400 p-4">
                                       <Award size={32} className="mx-auto mb-2 opacity-50" />
                                       <p className="text-xs">Select a course to generate certificate</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* Reports View */}
            {activeTab === Tab.Reports && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Reports Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button 
                         onClick={() => setActiveReportSubTab('courses')}
                         className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeReportSubTab === 'courses' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         {t.dept_report_title}
                      </button>
                      <button 
                         onClick={() => setActiveReportSubTab('units')}
                         className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeReportSubTab === 'units' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         {t.unit_report_title}
                      </button>
                      <button 
                         onClick={() => setActiveReportSubTab('consolidated')}
                         className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeReportSubTab === 'consolidated' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         {t.consolidated_report_title}
                      </button>
                   </div>
                   
                   <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg font-medium text-sm focus:outline-none"
                          >
                            {yearsList.map(year => <option key={year} value={year}>{year}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                           <select 
                              value={selectedDeptSeason}
                              onChange={(e) => setSelectedDeptSeason(e.target.value as Season)}
                              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg font-medium text-sm focus:outline-none"
                           >
                              {['Spring', 'Summer', 'Fall', 'Winter'].map(s => <option key={s} value={s}>{t[`season_${s.toLowerCase()}` as keyof typeof t]}</option>)}
                           </select>
                           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {canEditContent && (
                          <button onClick={handleAddYear} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">
                             <Plus size={16} />
                          </button>
                        )}
                   </div>
                </div>

                {/* Sub-Tab 1: Quarterly Course Performance (Excel Advanced style) - AGGREGATE */}
                {activeReportSubTab === 'courses' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                       <div className="flex items-center gap-3">
                         <div className={`p-2 bg-emerald-100 text-emerald-600 rounded-lg`}>
                           <TableIcon className="w-6 h-6" />
                         </div>
                         <div>
                           <h3 className="text-lg font-bold text-slate-900">{t.dept_report_title}</h3>
                           <p className="text-sm text-slate-500">{t.dept_report_subtitle}</p>
                         </div>
                       </div>
                       {canEditContent && (
                          <button onClick={handleSyncFromUnits} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">
                             <Layers size={16}/> {t.btn_sync_from_units}
                          </button>
                       )}
                     </div>

                     <div className="border rounded-xl overflow-hidden mb-6">
                        {/* Manual Entry Row for General Report */}
                        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                           <div className="md:col-span-2">
                              <label className="text-xs text-slate-500 font-bold mb-1 block">{t.lbl_course_name}</label>
                              <input type="text" value={newRowData.courseName} onChange={e => setNewRowData({...newRowData, courseName: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
                           </div>
                           <div>
                              <label className="text-xs text-slate-500 font-bold mb-1 block">{t.lbl_participants}</label>
                              <input type="number" value={newRowData.participants || ''} onChange={e => setNewRowData({...newRowData, participants: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
                           </div>
                           <div>
                              <label className="text-xs text-slate-500 font-bold mb-1 block">{t.lbl_cost_per_person}</label>
                              <input type="number" value={newRowData.costPerPerson || ''} onChange={e => setNewRowData({...newRowData, costPerPerson: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
                           </div>
                           <div>
                              <label className="text-xs text-slate-500 font-bold mb-1 block">{t.lbl_duration}</label>
                              <input type="number" value={newRowData.durationHours || ''} onChange={e => setNewRowData({...newRowData, durationHours: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
                           </div>
                           <button onClick={() => addReportRow(setGeneralCourseReports, 'General')} className="bg-emerald-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-emerald-700 h-[34px] flex items-center justify-center gap-1">
                              <Plus size={16} /> {t.btn_add_row}
                           </button>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left">
                              <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                 <tr>
                                    <th className="px-4 py-3 w-10 text-center">{t.lbl_row}</th>
                                    <th className="px-4 py-3">{t.lbl_course_name}</th>
                                    <th className="px-4 py-3">{t.lbl_participants}</th>
                                    <th className="px-4 py-3">{t.lbl_cost_per_person}</th>
                                    <th className="px-4 py-3">{t.lbl_duration}</th>
                                    <th className="px-4 py-3 bg-slate-50">{t.lbl_location}</th>
                                    <th className="px-4 py-3 bg-slate-50">{t.lbl_total_cost}</th>
                                    <th className="px-4 py-3 w-10"></th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {currentCoursesRows.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                       <td className="px-4 py-2 text-center text-slate-400">{idx + 1}</td>
                                       <td className="px-4 py-2 font-medium text-slate-800">{row.courseName}</td>
                                       <td className="px-4 py-2 text-slate-600">{row.participants}</td>
                                       <td className="px-4 py-2 text-slate-600">{row.costPerPerson.toLocaleString()}</td>
                                       <td className="px-4 py-2 text-slate-600">{row.durationHours}</td>
                                       <td className="px-4 py-2 text-slate-600 bg-slate-50/30">
                                          <input 
                                             type="text" 
                                             defaultValue={row.location} 
                                             className="bg-transparent w-full border-none focus:ring-0 text-sm"
                                             placeholder="-"
                                          />
                                       </td>
                                       <td className="px-4 py-2 font-bold text-slate-700 bg-slate-50/50">{row.totalCost.toLocaleString()}</td>
                                       <td className="px-4 py-2 text-center">
                                          <button onClick={() => deleteReportRow(setGeneralCourseReports, 'General', row.id)} className="text-red-400 hover:text-red-600 p-1"><Trash size={14} /></button>
                                       </td>
                                    </tr>
                                 ))}
                                 {currentCoursesRows.length > 0 && (
                                    <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-200">
                                       <td colSpan={2} className="px-4 py-3 text-center">{t.total_label}</td>
                                       <td className="px-4 py-3">{currentCoursesRows.reduce((a,b)=>a+b.participants,0)}</td>
                                       <td className="px-4 py-3 text-slate-600">-</td>
                                       <td className="px-4 py-3">{currentCoursesRows.reduce((a,b)=>a+b.durationHours,0)}</td>
                                       <td className="px-4 py-3">-</td>
                                       <td className="px-4 py-3 text-emerald-700">{totalCostSum.toLocaleString()}</td>
                                       <td></td>
                                    </tr>
                                 )}
                                 {currentCoursesRows.length === 0 && (
                                    <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">{t.no_data}</td></tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>

                     {coursePerformanceData.length > 0 && (
                        <div className="pt-6 mt-6 border-t border-slate-100 h-96">
                           <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><FileBarChart size={16} /> {t.chart_courses_quarterly}</h4>
                           <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={coursePerformanceData} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                                 <CartesianGrid stroke="#f5f5f5" />
                                 <XAxis dataKey="name" label={{ value: lang === 'fa' ? 'ردیف' : 'Row', position: 'insideBottomRight', offset: -10 }} scale="band" />
                                 <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                 <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                 <Legend />
                                 <Bar yAxisId="left" dataKey="participants" name={lang === 'fa' ? 'تعداد نفرات' : 'Participants'} barSize={20} fill="#413ea0" />
                                 <Bar yAxisId="left" dataKey="hours" name={lang === 'fa' ? 'ساعت' : 'Hours'} barSize={20} fill="#8884d8" />
                                 <Line yAxisId="right" type="monotone" dataKey="totalCost" name={lang === 'fa' ? 'هزینه کل' : 'Total Cost'} stroke="#ff7300" />
                              </ComposedChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </div>
                )}

                {/* Sub-Tab 3: Unit Performance Report (Detailed) - NEW */}
                {activeReportSubTab === 'units' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                           <div className={`p-2 bg-blue-100 text-blue-600 rounded-lg`}>
                              <Building2 className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-slate-900">{t.unit_report_title}</h3>
                              <p className="text-sm text-slate-500">{t.unit_report_subtitle}</p>
                           </div>
                        </div>
                        <div className="relative min-w-[250px]">
                           <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">{t.lbl_select_unit}</label>
                           <select 
                              value={selectedUnitName}
                              onChange={(e) => setSelectedUnitName(e.target.value)}
                              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                           >
                              {ORGANIZATIONAL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                           </select>
                           <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                     </div>

                     {/* Unit Input Form */}
                     <div className="border rounded-xl overflow-hidden mb-6">
                        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                           <div className="md:col-span-2">
                              <label className="text-xs text-slate-500 font-bold mb-1 block">{t.lbl_course_name}</label>
                              <input type="text" value={newRowData.courseName} onChange={e => setNewRowData({...newRowData, courseName: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
                           </div>
                           <div>
                              <label className="text-xs text-slate-500 font-bold mb-1 block">{t.lbl_participants}</label>
                              <input type="number" value={newRowData.participants || ''} onChange={e => setNewRowData({...newRowData, participants: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
                           </div>
                           <div>
                              <label className="text-xs text-slate-500 font-bold mb-1 block">{t.lbl_cost_per_person}</label>
                              <input type="number" value={newRowData.costPerPerson || ''} onChange={e => setNewRowData({...newRowData, costPerPerson: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
                           </div>
                           <div>
                              <label className="text-xs text-slate-500 font-bold mb-1 block">{t.lbl_duration}</label>
                              <input type="number" value={newRowData.durationHours || ''} onChange={e => setNewRowData({...newRowData, durationHours: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
                           </div>
                           <button onClick={() => addReportRow(setUnitReports, selectedUnitName)} className="bg-blue-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-blue-700 h-[34px] flex items-center justify-center gap-1">
                              <Plus size={16} /> {t.btn_add_row}
                           </button>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left">
                              <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                 <tr>
                                    <th className="px-4 py-3">{t.lbl_course_name}</th>
                                    <th className="px-4 py-3">{t.lbl_participants}</th>
                                    <th className="px-4 py-3">{t.lbl_duration}</th>
                                    <th className="px-4 py-3">{t.lbl_cost_per_person}</th>
                                    <th className="px-4 py-3 bg-slate-50">{t.lbl_total_cost}</th>
                                    <th className="px-4 py-3 bg-slate-50">{t.lbl_person_hours}</th>
                                    <th className="px-4 py-3 w-10"></th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {(unitReports[selectedYear]?.[selectedDeptSeason]?.[selectedUnitName] || []).map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                       <td className="px-4 py-2 font-medium text-slate-800">{row.courseName}</td>
                                       <td className="px-4 py-2 text-slate-600">{row.participants}</td>
                                       <td className="px-4 py-2 text-slate-600">{row.durationHours}</td>
                                       <td className="px-4 py-2 text-slate-600">{row.costPerPerson.toLocaleString()}</td>
                                       <td className="px-4 py-2 font-bold text-slate-700 bg-slate-50/50">{row.totalCost.toLocaleString()}</td>
                                       <td className="px-4 py-2 font-bold text-slate-700 bg-slate-50/50">{row.personHours.toLocaleString()}</td>
                                       <td className="px-4 py-2 text-center">
                                          <button onClick={() => deleteReportRow(setUnitReports, selectedUnitName, row.id)} className="text-red-400 hover:text-red-600 p-1"><Trash size={14} /></button>
                                       </td>
                                    </tr>
                                 ))}
                                 {(unitReports[selectedYear]?.[selectedDeptSeason]?.[selectedUnitName] || []).length === 0 && (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">{t.no_data}</td></tr>
                                 )}
                              </tbody>
                              <tfoot className="bg-slate-100 font-bold text-slate-800">
                                 <tr>
                                    <td className="px-4 py-3 text-right">{t.total_label}</td>
                                    <td className="px-4 py-3">{(unitReports[selectedYear]?.[selectedDeptSeason]?.[selectedUnitName] || []).reduce((a,b) => a + b.participants, 0)}</td>
                                    <td className="px-4 py-3">-</td>
                                    <td className="px-4 py-3">-</td>
                                    <td className="px-4 py-3 text-emerald-700">{(unitReports[selectedYear]?.[selectedDeptSeason]?.[selectedUnitName] || []).reduce((a,b) => a + b.totalCost, 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-blue-700">{(unitReports[selectedYear]?.[selectedDeptSeason]?.[selectedUnitName] || []).reduce((a,b) => a + b.personHours, 0).toLocaleString()}</td>
                                    <td></td>
                                 </tr>
                              </tfoot>
                           </table>
                        </div>
                     </div>

                     {/* 4 Season History Chart for this Unit */}
                     <div className="pt-6 mt-6 border-t border-slate-100 h-80">
                        <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><History size={16} /> {t.chart_unit_history} : {selectedUnitName}</h4>
                        <ResponsiveContainer width="100%" height="100%">
                           <RechartsBarChart data={getUnitHistoryData()} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} />
                              <YAxis axisLine={false} tickLine={false} />
                              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="personHours" name={t.lbl_person_hours} fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
                           </RechartsBarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                )}

                {/* Sub-Tab 2: Consolidated Report (Org Chart style) */}
                {activeReportSubTab === 'consolidated' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 bg-purple-100 text-purple-600 rounded-lg`}>
                                  <Briefcase className="w-6 h-6" />
                              </div>
                              <div>
                                  <h3 className="text-lg font-bold text-slate-900">{t.consolidated_report_title}</h3>
                                  <p className="text-sm text-slate-500">{t.consolidated_report_subtitle}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                             <button onClick={() => setConsolidatedChartMetric('personPersonnel')} className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${consolidatedChartMetric === 'totalPersonnel' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t.metric_personnel || 'Personnel'}</button>
                             <button onClick={() => setConsolidatedChartMetric('personHours')} className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${consolidatedChartMetric === 'personHours' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t.metric_person_hours || 'Person-Hours'}</button>
                             <button onClick={() => setConsolidatedChartMetric('totalCost')} className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${consolidatedChartMetric === 'totalCost' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t.metric_cost || 'Cost'}</button>
                          </div>
                      </div>

                      <div className="overflow-x-auto border rounded-xl mb-8">
                         <table className="w-full text-sm text-left">
                             <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                                 <tr>
                                     <th className="px-4 py-3 w-12 text-center">{t.lbl_row}</th>
                                     <th className="px-4 py-3">{t.col_org_unit}</th>
                                     <th className="px-4 py-3 w-32">{t.col_total_hours}</th>
                                     <th className="px-4 py-3 w-40">{t.col_total_cost}</th>
                                     <th className="px-4 py-3 w-32">{t.col_total_personnel}</th>
                                     <th className="px-4 py-3 w-32 bg-purple-50">{t.col_person_hours}</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                {ORGANIZATIONAL_UNITS.map((unit, index) => {
                                    const savedData = consolidatedReports[selectedYear]?.[selectedDeptSeason] || [];
                                    const item = savedData.find(i => i.unitName === unit) || {
                                        totalHours: 0,
                                        totalCost: 0,
                                        totalPersonnel: 0,
                                        personHours: 0
                                    };

                                    return (
                                      <tr key={unit} className="hover:bg-slate-50">
                                          <td className="px-4 py-2 text-center text-slate-400 font-medium">{index + 1}</td>
                                          <td className="px-4 py-2 font-medium text-slate-800">{unit}</td>
                                          <td className="px-4 py-2">
                                              <input 
                                                type="number" 
                                                className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 bg-transparent text-center focus:outline-none focus:bg-white"
                                                value={item.totalHours || ''}
                                                placeholder="0"
                                                onChange={(e) => updateConsolidatedItem(unit, 'totalHours', Number(e.target.value))}
                                              />
                                          </td>
                                          <td className="px-4 py-2">
                                              <input 
                                                type="number" 
                                                className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 bg-transparent text-center focus:outline-none focus:bg-white"
                                                value={item.totalCost || ''}
                                                placeholder="0"
                                                onChange={(e) => updateConsolidatedItem(unit, 'totalCost', Number(e.target.value))}
                                              />
                                          </td>
                                          <td className="px-4 py-2">
                                              <input 
                                                type="number" 
                                                className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 bg-transparent text-center focus:outline-none focus:bg-white"
                                                value={item.totalPersonnel || ''}
                                                placeholder="0"
                                                onChange={(e) => updateConsolidatedItem(unit, 'totalPersonnel', Number(e.target.value))}
                                              />
                                          </td>
                                          <td className="px-4 py-2 text-center font-bold text-purple-700 bg-purple-50/30">
                                              {item.personHours.toLocaleString()}
                                          </td>
                                      </tr>
                                    );
                                })}
                                {/* Total Row */}
                                <tr className="bg-slate-800 text-white font-bold">
                                    <td colSpan={2} className="px-4 py-3 text-center">{t.total_label}</td>
                                    <td className="px-4 py-3 text-center">
                                        {(consolidatedReports[selectedYear]?.[selectedDeptSeason] || []).reduce((a, b) => a + (b.totalHours || 0), 0)}
                                    </td>
                                    <td className="px-4 py-3 text-center text-emerald-300">
                                        {(consolidatedReports[selectedYear]?.[selectedDeptSeason] || []).reduce((a, b) => a + (b.totalCost || 0), 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {(consolidatedReports[selectedYear]?.[selectedDeptSeason] || []).reduce((a, b) => a + (b.totalPersonnel || 0), 0)}
                                    </td>
                                    <td className="px-4 py-3 text-center text-yellow-300">
                                        {(consolidatedReports[selectedYear]?.[selectedDeptSeason] || []).reduce((a, b) => a + (b.personHours || 0), 0).toLocaleString()}
                                    </td>
                                </tr>
                             </tbody>
                         </table>
                      </div>

                      <div className="h-96 w-full">
                         <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                            <TrendingUp size={16} /> {t.chart_consolidated}
                         </h4>
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart 
                              data={getConsolidatedDataForChart()} 
                              margin={{top: 20, right: 30, left: 20, bottom: 100}}
                            >
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis 
                                 dataKey="name" 
                                 interval={0} 
                                 angle={-90} 
                                 textAnchor="end" 
                                 height={100} 
                                 tick={{fontSize: 10}} 
                               />
                               <YAxis />
                               <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                               <Bar 
                                 dataKey="value" 
                                 name={consolidatedChartMetric === 'totalCost' ? t.metric_cost : consolidatedChartMetric === 'personHours' ? t.metric_person_hours : t.metric_personnel} 
                                 fill="#8b5cf6" 
                                 radius={[4, 4, 0, 0]} 
                               />
                            </RechartsBarChart>
                         </ResponsiveContainer>
                      </div>
                  </div>
                )}
              </div>
            )}
            
            {/* AI View */}
             {activeTab === Tab.AI && (
                 <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
                       <div className="flex gap-2 bg-slate-200/50 p-1 rounded-lg">
                          <button onClick={() => setAiMode('chat')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${aiMode === 'chat' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t.ai_mode_chat}</button>
                          <button onClick={() => setAiMode('studio')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${aiMode === 'studio' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t.ai_mode_studio}</button>
                       </div>
                    </div>

                    {aiMode === 'chat' ? (
                       <>
                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                             {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                   <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-500">
                                      <Bot size={40} />
                                   </div>
                                   <h3 className="text-xl font-bold text-slate-800 mb-2">{t.ai_welcome_title}</h3>
                                   <p className="max-w-md text-slate-500">{t.ai_welcome_desc}</p>
                                </div>
                             )}
                             {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? `bg-${theme}-600 text-white rounded-br-none` : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                   </div>
                                </div>
                             ))}
                             {isTyping && (
                                <div className="flex justify-start">
                                   <div className="bg-slate-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-1">
                                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                   </div>
                                </div>
                             )}
                             <div ref={chatEndRef} />
                          </div>
                          <div className="p-4 border-t border-slate-100 bg-white">
                             <div className="relative flex items-center gap-2">
                                <button 
                                  onClick={toggleVoiceMode}
                                  className={`p-3 rounded-full transition ${isVoiceMode ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                   {isVoiceMode ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <input
                                   type="text"
                                   value={inputMessage}
                                   onChange={(e) => setInputMessage(e.target.value)}
                                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                   placeholder={isVoiceMode ? t.listening : t.input_placeholder}
                                   disabled={isVoiceMode}
                                   className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button 
                                  onClick={handleSendMessage}
                                  disabled={!inputMessage.trim() || isVoiceMode}
                                  className={`p-3 rounded-xl transition ${!inputMessage.trim() ? 'bg-slate-100 text-slate-300' : `bg-${theme}-600 text-white hover:bg-${theme}-700 shadow-lg shadow-${theme}-500/20`}`}
                                >
                                   <Send size={20} />
                                </button>
                             </div>
                             {isVoiceMode && <p className="text-center text-xs text-red-500 mt-2 font-medium">{t.listening_desc}</p>}
                          </div>
                       </>
                    ) : (
                       <div className="p-6 h-full overflow-y-auto">
                          <div className="max-w-2xl mx-auto">
                             <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-slate-900">{t.studio_title}</h3>
                                <p className="text-slate-500">{t.studio_desc}</p>
                             </div>
                             
                             <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">{t.field_topic}</label>
                                   <input type="text" value={genForm.topic} onChange={e => setGenForm({...genForm, topic: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Industrial Safety 101" />
                                </div>
                                <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">{t.field_audience}</label>
                                   <input type="text" value={genForm.targetAudience} onChange={e => setGenForm({...genForm, targetAudience: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. New Technicians" />
                                </div>
                                <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">{t.field_description}</label>
                                   <textarea value={genForm.description} onChange={e => setGenForm({...genForm, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20" placeholder="Key points to cover..." />
                                </div>
                                <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-2">{t.field_format}</label>
                                   <div className="grid grid-cols-3 gap-3">
                                      {(['video', 'pamphlet', 'powerpoint'] as ContentFormat[]).map(f => (
                                         <button 
                                            key={f}
                                            onClick={() => setGenForm({...genForm, format: f})}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${genForm.format === f ? `border-${theme}-500 bg-${theme}-50 text-${theme}-700` : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                                         >
                                            {f === 'video' ? <Video size={20} /> : f === 'pamphlet' ? <FileType size={20} /> : <Presentation size={20} />}
                                            <span className="text-xs font-bold">{f === 'video' ? t.format_video : f === 'pamphlet' ? t.format_pamphlet : t.format_ppt}</span>
                                         </button>
                                      ))}
                                   </div>
                                </div>
                                <button 
                                   onClick={handleGenerateContent}
                                   disabled={isGeneratingContent || !genForm.topic}
                                   className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 ${isGeneratingContent ? 'bg-slate-400 cursor-not-allowed' : `bg-${theme}-600 hover:bg-${theme}-700 shadow-${theme}-500/30`}`}
                                >
                                   {isGeneratingContent ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                                   {isGeneratingContent ? t.generating_content : t.btn_generate_content}
                                </button>
                             </div>

                             {generatedContentUrl && (
                                <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
                                   <div className="flex items-center gap-3">
                                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                         <CheckCircle size={24} />
                                      </div>
                                      <div>
                                         <p className="font-bold text-emerald-800">Content Generated Successfully!</p>
                                         <p className="text-xs text-emerald-600">Ready for download</p>
                                      </div>
                                   </div>
                                   <button onClick={downloadGeneratedFile} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">
                                      <Download size={16} /> {t.download_content}
                                   </button>
                                </div>
                             )}
                          </div>
                       </div>
                    )}
                 </div>
             )}

            {/* Settings */}
             {activeTab === Tab.Settings && (
               <div className="max-w-4xl mx-auto space-y-6">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900">{t.settings_title}</h2>
                   <p className="text-slate-500 text-sm mt-1">{t.settings_org_info}</p>
                 </div>

                 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                   <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                     <Building2 className="w-5 h-5 text-slate-400" /> {t.settings_org_info}
                   </h3>
                   <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                       <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">{t.settings_company_name}</label>
                         <input
                           type="text"
                           value={systemSettings.companyName}
                           onChange={(e) => handleSettingsChange('companyName', e.target.value)}
                           className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">{t.settings_ceo_name}</label>
                         <input
                           type="text"
                           value={systemSettings.ceoName}
                           onChange={(e) => handleSettingsChange('ceoName', e.target.value)}
                           className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">{t.settings_manager_name}</label>
                         <input
                           type="text"
                           value={systemSettings.trainingManagerName}
                           onChange={(e) => handleSettingsChange('trainingManagerName', e.target.value)}
                           className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                         />
                       </div>
                     </div>
                     
                     <div className="space-y-4">
                       <label className="block text-sm font-medium text-slate-700 mb-1">{t.settings_logo}</label>
                       <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer relative">
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                         {systemSettings.logo ? (
                           <img src={systemSettings.logo} alt="Company Logo" className="h-24 object-contain mb-2" />
                         ) : (
                           <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                         )}
                         <span className="text-sm font-medium text-indigo-600">{t.btn_upload_logo}</span>
                         <p className="text-xs text-slate-400 mt-1">{t.settings_logo_desc}</p>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-slate-400" /> {t.settings_theme}
                    </h3>
                    <div className="flex flex-wrap gap-4">
                       {(['blue', 'emerald', 'violet', 'rose', 'amber'] as ThemeColor[]).map(color => (
                          <button
                             key={color}
                             onClick={() => setTheme(color)}
                             className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${theme === color ? 'ring-4 ring-offset-2 ring-slate-200' : ''}`}
                             style={{ backgroundColor: `var(--color-${color}-500)` }} 
                          >
                             <div className={`w-full h-full rounded-full bg-${color}-500`}></div>
                          </button>
                       ))}
                    </div>
                 </div>
               </div>
             )}
             
          </div>
        </div>

        {/* Floating Save Indicator */}
        <div className={`fixed bottom-6 left-6 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 transform ${showSaveIndicator ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <Save size={16} className="text-emerald-400" />
           <span className="text-sm font-medium">Changes Saved</span>
        </div>

      </main>

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="font-bold text-lg text-slate-800">{editingCourseId ? t.btn_edit_course : t.btn_new_course}</h3>
                 <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.col_course_name}</label>
                    <input type="text" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20" autoFocus />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">{t.filter_type_label}</label>
                       <select value={courseForm.type} onChange={e => setCourseForm({...courseForm, type: e.target.value as any})} className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                          <option value="internal">Internal</option>
                          <option value="external">External</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">{t.col_status}</label>
                       <select value={courseForm.status} onChange={e => setCourseForm({...courseForm, status: e.target.value as any})} className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.field_progress} ({courseForm.completion}%)</label>
                    <input type="range" min="0" max="100" value={courseForm.completion} onChange={e => setCourseForm({...courseForm, completion: Number(e.target.value)})} className="w-full accent-indigo-600" />
                 </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">{t.btn_cancel}</button>
                 <button onClick={handleSaveCourse} className={`px-4 py-2 bg-${theme}-600 text-white font-bold rounded-lg hover:bg-${theme}-700 transition shadow-lg shadow-${theme}-500/30`}>{t.save_changes}</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;