/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  FileText,
  Users,
  LogOut,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Shield,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  Brain,
  GraduationCap,
  HelpCircle,
  BookMarked,
  UserCheck,
  Layers,
  TrendingUp,
  FileCheck
} from 'lucide-react';

// --- Types ---
type Role = 'Admin' | 'Manager' | 'Staff';

interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  department: string;
}

interface TrainingDocument {
  id: string;
  title: string;
  department: string;
  content: string;
  createdAt: string;
  author: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizAssignment {
  id: string;
  staffUsername: string;
  staffName: string;
  documentId: string;
  documentTitle: string;
  questions: QuizQuestion[];
  status: 'Pending' | 'Completed';
  score: number | null; // percentage 0-100
  answers?: Record<number, number>; // questionIndex -> selectedOptionIndex
  completedAt?: string;
  assignedAt: string;
}

// --- Default Seed Data ---
const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', name: 'Director Sarah Jenkins', role: 'Admin', department: 'Executive' },
  { id: 'u2', username: 'manager1', name: 'Manager David Chen', role: 'Manager', department: 'Engineering' },
  { id: 'u3', username: 'manager2', name: 'Manager Elena Rostova', role: 'Manager', department: 'Human Resources' },
  { id: 'u4', username: 'staff1', name: 'Alex Mercer', role: 'Staff', department: 'Engineering' },
  { id: 'u5', username: 'staff2', name: 'Jessica Taylor', role: 'Staff', department: 'Operations' },
  { id: 'u6', username: 'staff3', name: 'Marcus Vance', role: 'Staff', department: 'Quality Assurance' },
];

const INITIAL_DOCUMENTS: TrainingDocument[] = [
  {
    id: 'doc-1',
    title: 'ISO 9001 Quality Assurance & Compliance Standard',
    department: 'Quality Assurance',
    content: `ISO 9001 outlines the requirements for a quality management system (QMS). Organizations must demonstrate the ability to consistently provide products and services that meet customer and regulatory requirements. Key principles include customer focus, leadership, engagement of people, process approach, improvement, evidence-based decision making, and relationship management. Annual audits are mandatory for all production lines. Non-conformances must be logged within 24 hours in the QA Portal and resolved within 14 business days.`,
    createdAt: '2026-01-15',
    author: 'Director Sarah Jenkins'
  },
  {
    id: 'doc-2',
    title: 'Information Security & Data Privacy Guidelines (SOC2)',
    department: 'Engineering',
    content: `All employees must adhere to strict information security protocols. Multi-factor authentication (MFA) is compulsory for all corporate applications. Passwords must be at least 14 characters long and rotated every 90 days. Handling of Personally Identifiable Information (PII) requires encryption both in transit (TLS 1.3) and at rest (AES-256). Any suspected data breach or phishing attempt must be reported immediately to the Security Operations Center (SOC) via sec-alert@enterprise.internal.`,
    createdAt: '2026-02-01',
    author: 'Manager David Chen'
  },
  {
    id: 'doc-3',
    title: 'Customer Escalation & Incident Management Framework',
    department: 'Operations',
    content: `Customer incidents are classified into 4 severity tiers: P1 (Critical system outage), P2 (Major feature degradation), P3 (Minor bug), and P4 (General inquiry). P1 incidents require acknowledgement within 15 minutes and hourly executive status updates. Support staff must maintain professional de-escalation communication, utilizing empathy statements and proactive follow-ups. Post-incident reviews (PIRs) are required for all P1 and P2 events within 48 hours of resolution.`,
    createdAt: '2026-02-10',
    author: 'Manager Elena Rostova'
  }
];

const INITIAL_QUIZZES: QuizAssignment[] = [
  {
    id: 'quiz-1',
    staffUsername: 'staff1',
    staffName: 'Alex Mercer',
    documentId: 'doc-1',
    documentTitle: 'ISO 9001 Quality Assurance & Compliance Standard',
    status: 'Pending',
    score: null,
    assignedAt: '2026-02-20',
    questions: [
      {
        id: 'q1',
        question: 'Within how many hours must non-conformances be logged in the QA Portal according to ISO 9001 standards?',
        options: ['12 hours', '24 hours', '48 hours', '7 business days'],
        correctIndex: 1,
        explanation: 'Non-conformances must be logged within 24 hours in the QA Portal.'
      },
      {
        id: 'q2',
        question: 'What is the mandatory timeframe to resolve logged non-conformances?',
        options: ['7 business days', '14 business days', '30 calendar days', '60 days'],
        correctIndex: 1,
        explanation: 'Resolution is required within 14 business days.'
      },
      {
        id: 'q3',
        question: 'Which of the following is NOT listed as a key principle of the QMS in the document?',
        options: ['Customer focus', 'Evidence-based decision making', 'Aggressive market takeover', 'Engagement of people'],
        correctIndex: 2,
        explanation: 'Aggressive market takeover is not a QMS principle.'
      }
    ]
  },
  {
    id: 'quiz-2',
    staffUsername: 'staff1',
    staffName: 'Alex Mercer',
    documentId: 'doc-2',
    documentTitle: 'Information Security & Data Privacy Guidelines (SOC2)',
    status: 'Completed',
    score: 100,
    assignedAt: '2026-02-18',
    completedAt: '2026-02-19',
    answers: { 0: 0, 1: 1 },
    questions: [
      {
        id: 'sec-1',
        question: 'What is the minimum required length for corporate passwords?',
        options: ['8 characters', '10 characters', '14 characters', '20 characters'],
        correctIndex: 2,
        explanation: 'Passwords must be at least 14 characters long.'
      },
      {
        id: 'sec-2',
        question: 'What encryption standard is mandated for data at rest containing PII?',
        options: ['AES-256', 'DES', 'MD5', 'RC4'],
        correctIndex: 0,
        explanation: 'Data at rest requires AES-256 encryption.'
      }
    ]
  }
];

export default function App() {
  // --- State ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lms_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lms_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Documents
  const [documents, setDocuments] = useState<TrainingDocument[]>(() => {
    const saved = localStorage.getItem('lms_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  // Quizzes
  const [quizzes, setQuizzes] = useState<QuizAssignment[]>(() => {
    const saved = localStorage.getItem('lms_quizzes');
    return saved ? JSON.parse(saved) : INITIAL_QUIZZES;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'assign' | 'take_quiz' | 'gradebook' | 'tutor' | 'users'>('dashboard');

  // Active quiz being taken by staff
  const [activeQuiz, setActiveQuiz] = useState<QuizAssignment | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; correctCount: number; total: number } | null>(null);

  // New Document modal/form state
  const [showDocForm, setShowDocForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDept, setNewDocDept] = useState('Engineering');
  const [newDocContent, setNewDocContent] = useState('');

  // Quiz Assignment form state
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedStaffUsernames, setSelectedStaffUsernames] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [genError, setGenError] = useState('');

  // AI Tutor state
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorDocId, setTutorDocId] = useState(documents[0]?.id || '');
  const [tutorChat, setTutorChat] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I am your AI Training Tutor. Ask me any questions about our standard operating procedures, security guidelines, or compliance policies.' }
  ]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // New user form (Admin)
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('Staff');
  const [newDept, setNewDept] = useState('Engineering');
  const [newPassword, setNewPassword] = useState('password123');

  // Persistence
  useEffect(() => {
    localStorage.setItem('lms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lms_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lms_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lms_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('lms_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  // --- Login Handler ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const found = users.find(u => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
    if (!found) {
      setLoginError('Invalid username. Try demo accounts: admin, manager1, staff1');
      return;
    }
    // simple password check (accepts any password for convenience or default 123)
    setCurrentUser(found);
    setActiveTab('dashboard');
  };

  const handleQuickLogin = (username: string) => {
    const found = users.find(u => u.username === username);
    if (found) {
      setCurrentUser(found);
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveQuiz(null);
  };

  // --- Document Creation ---
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    const newDoc: TrainingDocument = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      department: newDocDept,
      content: newDocContent.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      author: currentUser?.name || 'Admin'
    };
    setDocuments([newDoc, ...documents]);
    setNewDocTitle('');
    setNewDocContent('');
    setShowDocForm(false);
  };

  // --- AI Quiz Generation & Assignment ---
  const handleGenerateAndAssignQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError('');
    if (!selectedDocId) {
      setGenError('Please select a job function document.');
      return;
    }
    if (selectedStaffUsernames.length === 0) {
      setGenError('Please select at least one staff member.');
      return;
    }

    const targetDoc = documents.find(d => d.id === selectedDocId);
    if (!targetDoc) {
      setGenError('Selected document not found.');
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: targetDoc.content,
          documentTitle: targetDoc.title,
          numQuestions: Number(numQuestions)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz');

      const generatedQuestions: QuizQuestion[] = data.questions || [];

      // Create quiz assignments for each selected staff
      const newAssignments: QuizAssignment[] = selectedStaffUsernames.map(username => {
        const staffObj = users.find(u => u.username === username);
        return {
          id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          staffUsername: username,
          staffName: staffObj ? staffObj.name : username,
          documentId: targetDoc.id,
          documentTitle: targetDoc.title,
          questions: generatedQuestions,
          status: 'Pending',
          score: null,
          assignedAt: new Date().toISOString().split('T')[0]
        };
      });

      setQuizzes([...newAssignments, ...quizzes]);
      setSelectedStaffUsernames([]);
      setSelectedDocId('');
      setActiveTab('gradebook');
    } catch (err: any) {
      setGenError(err.message || 'Error communicating with AI service.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // --- Quiz Taking ---
  const startQuiz = (quiz: QuizAssignment) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setActiveTab('take_quiz');
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / activeQuiz.questions.length) * 100);
    const completedTimestamp = new Date().toISOString().split('T')[0];

    // Update quiz in state
    const updatedQuizzes = quizzes.map(q => {
      if (q.id === activeQuiz.id) {
        return {
          ...q,
          status: 'Completed' as const,
          score: scorePct,
          answers: quizAnswers,
          completedAt: completedTimestamp
        };
      }
      return q;
    });

    setQuizzes(updatedQuizzes);
    setQuizSubmitted(true);
    setQuizResult({ score: scorePct, correctCount, total: activeQuiz.questions.length });
  };

  // --- AI Tutor Chat Handler ---
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuestion.trim() || isTutorLoading) return;

    const userMsg = tutorQuestion.trim();
    setTutorQuestion('');
    const newChat = [...tutorChat, { role: 'user' as const, content: userMsg }];
    setTutorChat(newChat);
    setIsTutorLoading(true);

    const docContext = documents.find(d => d.id === tutorDocId)?.content || '';

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, documentContext: docContext })
      });
      const data = await res.json();
      setTutorChat([...newChat, { role: 'assistant', content: data.answer || 'I am ready to help.' }]);
    } catch (err) {
      setTutorChat([...newChat, { role: 'assistant', content: 'Sorry, I encountered an issue connecting to the AI tutor service.' }]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // --- Add User Handler (Admin) ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) return;
    const exists = users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase());
    if (exists) {
      alert('Username already exists.');
      return;
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      name: newName.trim(),
      role: newRole,
      department: newDept
    };
    setUsers([...users, newUser]);
    setNewUsername('');
    setNewName('');
    setShowUserModal(false);
  };

  // --- Render Login Screen if not authenticated ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 selection:bg-indigo-500 selection:text-white">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600/10 text-indigo-400 mb-4 border border-indigo-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Enterprise LMS</h1>
            <p className="text-sm text-slate-400 mt-1">Role-Based Training & AI Quiz Assessment Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="e.g. admin, manager1, staff1"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              Sign In
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 text-center">Quick Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition-colors text-center"
              >
                <span className="font-semibold text-indigo-400 block">Admin</span>
                <span>admin</span>
              </button>
              <button
                onClick={() => handleQuickLogin('manager1')}
                className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition-colors text-center"
              >
                <span className="font-semibold text-purple-400 block">Manager</span>
                <span>manager1</span>
              </button>
              <button
                onClick={() => handleQuickLogin('staff1')}
                className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition-colors text-center"
              >
                <span className="font-semibold text-emerald-400 block">Staff</span>
                <span>staff1</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Filtered Quizzes for Current User ---
  const staffQuizzes = quizzes.filter(q => q.staffUsername === currentUser.username);
  const pendingQuizzes = staffQuizzes.filter(q => q.status === 'Pending');
  const completedQuizzes = staffQuizzes.filter(q => q.status === 'Completed');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Bar - Following strict Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-8 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Enterprise LMS
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeTab === 'dashboard' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeTab === 'documents' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            SOP Library
          </button>
          {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
            <>
              <button
                onClick={() => setActiveTab('assign')}
                className={`transition-colors whitespace-nowrap shrink-0 ${activeTab === 'assign' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
              >
                Assign Quizzes
              </button>
              <button
                onClick={() => setActiveTab('gradebook')}
                className={`transition-colors whitespace-nowrap shrink-0 ${activeTab === 'gradebook' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
              >
                Team Gradebook
              </button>
            </>
          )}
          {currentUser.role === 'Staff' && (
            <button
              onClick={() => setActiveTab('gradebook')}
              className={`transition-colors whitespace-nowrap shrink-0 ${activeTab === 'gradebook' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
            >
              My Performance
            </button>
          )}
          <button
            onClick={() => setActiveTab('tutor')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeTab === 'tutor' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            AI Study Tutor
          </button>
          {currentUser.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`transition-colors whitespace-nowrap shrink-0 ${activeTab === 'users' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
            >
              User Management
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action / User Profile */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{currentUser.name}</p>
              <p className="text-[11px] text-indigo-400 font-mono">{currentUser.role} · {currentUser.department}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* --- TAB: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-950/60 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none"></div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Welcome back, {currentUser.name}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                  {currentUser.role === 'Staff' ? 'Your Training & Assessment Hub' : 'Enterprise LMS Management Center'}
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {currentUser.role === 'Staff'
                    ? 'Complete assigned quizzes, review SOP documents, and track your certification progress.'
                    : 'Manage job function documents, generate AI quizzes up to 30 questions, and monitor organizational performance.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics / Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Assigned Quizzes</span>
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {currentUser.role === 'Staff' ? staffQuizzes.length : quizzes.length}
                </div>
                <p className="text-xs text-slate-500 mt-1">Total active assignments</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Pending Tasks</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {currentUser.role === 'Staff' ? pendingQuizzes.length : quizzes.filter(q => q.status === 'Pending').length}
                </div>
                <p className="text-xs text-slate-500 mt-1">Requires completion</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">SOP Documents</span>
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {documents.length}
                </div>
                <p className="text-xs text-slate-500 mt-1">Available training guides</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Average Score</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {(() => {
                    const completed = currentUser.role === 'Staff' ? completedQuizzes : quizzes.filter(q => q.status === 'Completed' && q.score !== null);
                    if (completed.length === 0) return 'N/A';
                    const avg = completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length;
                    return `${Math.round(avg)}%`;
                  })()}
                </div>
                <p className="text-xs text-slate-500 mt-1">Across completed quizzes</p>
              </div>
            </div>

            {/* Staff Pending Quizzes Section */}
            {currentUser.role === 'Staff' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Pending Quizzes</h2>
                  <span className="text-xs text-slate-400">{pendingQuizzes.length} pending</span>
                </div>

                {pendingQuizzes.length === 0 ? (
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-200">All caught up!</p>
                    <p className="text-xs text-slate-500 mt-1">You have no pending quiz assignments at this time.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingQuizzes.map(quiz => (
                      <div key={quiz.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                              Pending
                            </span>
                            <span className="text-xs text-slate-500">Assigned: {quiz.assignedAt}</span>
                          </div>
                          <h3 className="text-base font-semibold text-white mb-2">{quiz.documentTitle}</h3>
                          <p className="text-xs text-slate-400 mb-4">{quiz.questions.length} multiple-choice questions</p>
                        </div>
                        <button
                          onClick={() => startQuiz(quiz)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Start Quiz</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manager / Admin Quick Overview */}
            {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('assign')}
                      className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors group"
                    >
                      <Brain className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-semibold text-white">Generate Quiz</p>
                      <p className="text-xs text-slate-400 mt-0.5">AI-driven up to 30 Qs</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors group"
                    >
                      <FileText className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-semibold text-white">Upload SOP</p>
                      <p className="text-xs text-slate-400 mt-0.5">Add training manuals</p>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-white mb-4">Recent Quiz Submissions</h3>
                  <div className="space-y-3">
                    {quizzes.filter(q => q.status === 'Completed').slice(0, 3).map(q => (
                      <div key={q.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-800/80 last:border-0">
                        <div>
                          <p className="font-medium text-slate-200">{q.staffName}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{q.documentTitle}</p>
                        </div>
                        <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                          {q.score}%
                        </span>
                      </div>
                    ))}
                    {quizzes.filter(q => q.status === 'Completed').length === 0 && (
                      <p className="text-xs text-slate-500 py-4 text-center">No completed submissions yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: DOCUMENTS / SOP LIBRARY --- */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Job Function & SOP Library</h1>
                <p className="text-sm text-slate-400 mt-1">Source manuals, standard operating procedures, and compliance documents.</p>
              </div>
              {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
                <button
                  onClick={() => setShowDocForm(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload SOP Document</span>
                </button>
              )}
            </div>

            {/* Document Creation Modal / Form */}
            {showDocForm && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">New SOP Source Document</h3>
                  <button onClick={() => setShowDocForm(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateDocument} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Document Title</label>
                      <input
                        type="text"
                        value={newDocTitle}
                        onChange={e => setNewDocTitle(e.target.value)}
                        placeholder="e.g. Remote Infrastructure Security Protocol"
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Department</label>
                      <select
                        value={newDocDept}
                        onChange={e => setNewDocDept(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Quality Assurance">Quality Assurance</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">SOP Content / Text Body</label>
                    <textarea
                      value={newDocContent}
                      onChange={e => setNewDocContent(e.target.value)}
                      rows={6}
                      placeholder="Paste standard operating procedures, training manual details, or compliance policies here..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDocForm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      Save & Publish Document
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Document Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {documents.map(doc => (
                <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                      <span className="text-indigo-400 font-mono">{doc.department}</span>
                      <span>{doc.createdAt}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{doc.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed mb-4">{doc.content}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span>By {doc.author}</span>
                    <button
                      onClick={() => {
                        setTutorDocId(doc.id);
                        setActiveTab('tutor');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask AI Tutor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: ASSIGN QUIZ (Manager/Admin) --- */}
        {activeTab === 'assign' && (currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AI Quiz Generator & Assignment</h1>
              <p className="text-sm text-slate-400 mt-1">Generate comprehensive quizzes (up to 30 questions) using Gemini AI based on SOP documents.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <form onSubmit={handleGenerateAndAssignQuiz} className="space-y-6">
                
                {/* 1. Select Document */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">1. Select Job Function Document</label>
                  <select
                    value={selectedDocId}
                    onChange={e => setSelectedDocId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">-- Choose Training SOP --</option>
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>{d.title} ({d.department})</option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Staff Members */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">2. Select Staff Members (Multiselect)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const allStaff = users.filter(u => u.role === 'Staff').map(u => u.username);
                        setSelectedStaffUsernames(allStaff);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Select All Staff
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                    {users.filter(u => u.role === 'Staff').map(staff => {
                      const isSelected = selectedStaffUsernames.includes(staff.username);
                      return (
                        <label
                          key={staff.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600/10 border border-indigo-500/30 text-white' : 'hover:bg-slate-900 text-slate-300'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedStaffUsernames([...selectedStaffUsernames, staff.username]);
                                } else {
                                  setSelectedStaffUsernames(selectedStaffUsernames.filter(u => u !== staff.username));
                                }
                              }}
                              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium">{staff.name}</span>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">{staff.department}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Number of Questions Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">3. Number of Questions (1 - 30)</label>
                    <span className="text-sm font-mono font-semibold text-indigo-400">{numQuestions} Questions</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={numQuestions}
                    onChange={e => setNumQuestions(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>1 (Quick check)</span>
                    <span>15 (Standard)</span>
                    <span>30 (Comprehensive)</span>
                  </div>
                </div>

                {genError && (
                  <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{genError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGeneratingQuiz}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating & Assigning Quiz with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate & Assign Quiz</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- TAB: TAKE QUIZ (Staff) --- */}
        {activeTab === 'take_quiz' && activeQuiz && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Active Assessment</span>
                <h1 className="text-2xl font-bold tracking-tight text-white mt-1">{activeQuiz.documentTitle}</h1>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Exit Quiz
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-8">
              {!quizSubmitted ? (
                <>
                  <div className="space-y-8">
                    {activeQuiz.questions.map((q, qIdx) => (
                      <div key={q.id} className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-mono font-semibold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                            {qIdx + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-100 pt-1">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 pl-10">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${isSelected ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'}`}
                              >
                                <span>{opt}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600'}`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      Answered: {Object.keys(quizAnswers).length} of {activeQuiz.questions.length} questions
                    </span>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </>
              ) : (
                /* Quiz Results & Review */
                <div className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Quiz Completed Successfully!</h2>
                    <p className="text-sm text-slate-400 mt-1">Your score has been automatically recorded in the gradebook.</p>
                  </div>

                  <div className="inline-flex items-center gap-6 px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Final Score</p>
                      <p className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">{quizResult?.score}%</p>
                    </div>
                    <div className="h-10 w-px bg-slate-800"></div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Correct Answers</p>
                      <p className="text-3xl font-bold text-white font-mono tabular-nums">{quizResult?.correctCount} / {quizResult?.total}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-left mt-8 pt-8 border-t border-slate-800">
                    <h3 className="text-base font-semibold text-white">Detailed Answer Review</h3>
                    {activeQuiz.questions.map((q, qIdx) => {
                      const userAns = quizAnswers[qIdx];
                      const isCorrect = userAns === q.correctIndex;
                      return (
                        <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-red-950/20 border-red-900/40'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-slate-200">{qIdx + 1}. {q.question}</p>
                            {isCorrect ? (
                              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">Correct</span>
                            ) : (
                              <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded shrink-0">Incorrect</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            <strong className="text-slate-300">Your Answer:</strong> {userAns !== undefined ? q.options[userAns] : 'Not answered'}
                          </p>
                          {!isCorrect && (
                            <p className="text-xs text-emerald-400 mt-1">
                              <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-2 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                            {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: GRADEBOOK / PERFORMANCE --- */}
        {activeTab === 'gradebook' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {currentUser.role === 'Staff' ? 'My Performance & History' : 'Organizational Staff Gradebook'}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {currentUser.role === 'Staff' ? 'Review your completed quiz history, certificates, and scores.' : 'Comprehensive records of all staff quiz assignments and scores.'}
                </p>
              </div>
            </div>

            {/* Gradebook Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-800">
                      <th className="px-6 py-4">Staff Member</th>
                      <th className="px-6 py-4">Document Title</th>
                      <th className="px-6 py-4">Assigned Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {(currentUser.role === 'Staff' ? staffQuizzes : quizzes).map(q => (
                      <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{q.staffName}</td>
                        <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{q.documentTitle}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs font-mono">{q.assignedAt}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${q.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-200">
                          {q.score !== null ? `${q.score}%` : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {q.status === 'Pending' && currentUser.role === 'Staff' && (
                            <button
                              onClick={() => startQuiz(q)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Take Quiz
                            </button>
                          )}
                          {q.status === 'Completed' && (
                            <button
                              onClick={() => startQuiz(q)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              Review Result
                            </button>
                          )}
                          {q.status === 'Pending' && currentUser.role !== 'Staff' && (
                            <span className="text-xs text-slate-500 font-mono">Awaiting Staff</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(currentUser.role === 'Staff' ? staffQuizzes : quizzes).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No quiz records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: AI STUDY TUTOR --- */}
        {activeTab === 'tutor' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AI Study Assistant & Tutor</h1>
              <p className="text-sm text-slate-400 mt-1">Ask questions about any corporate SOP or compliance document and receive instant AI guidance.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[600px] shadow-xl overflow-hidden">
              {/* Context Selector Bar */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <BookMarked className="w-4 h-4 text-indigo-400" />
                  <span>Active Context SOP:</span>
                </div>
                <select
                  value={tutorDocId}
                  onChange={e => setTutorDocId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-sm truncate"
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              {/* Chat Stream Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {tutorChat.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
                      {msg.role === 'user' ? currentUser.name.charAt(0) : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTutorLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>AI Tutor is reviewing the SOP document...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleTutorSubmit} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
                <input
                  type="text"
                  value={tutorQuestion}
                  onChange={e => setTutorQuestion(e.target.value)}
                  placeholder="Ask a question about the selected SOP document..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={!tutorQuestion.trim() || isTutorLoading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium rounded-xl text-xs sm:text-sm transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- TAB: USER MANAGEMENT (Admin) --- */}
        {activeTab === 'users' && currentUser.role === 'Admin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">User & Role Management</h1>
                <p className="text-sm text-slate-400 mt-1">Admin control over system users, roles (Admin, Manager, Staff), and departments.</p>
              </div>
              <button
                onClick={() => setShowUserModal(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            </div>

            {/* New User Modal */}
            {showUserModal && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Create New System User</h3>
                  <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Username (login handle)</label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        placeholder="e.g. jsmith"
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. John Smith"
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Role</label>
                      <select
                        value={newRole}
                        onChange={e => setNewRole(e.target.value as Role)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Staff">Staff</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Department</label>
                      <select
                        value={newDept}
                        onChange={e => setNewDept(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Quality Assurance">Quality Assurance</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUserModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      Create User Account
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-800">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Username</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-300 text-xs">{u.username}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${u.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : u.role === 'Manager' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{u.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
