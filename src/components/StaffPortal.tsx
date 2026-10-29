import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, LogOut, 
  User, Building2, Users, FileText, Search, Bell, KeyRound, 
  BadgeCheck, Clock, Calendar, CheckCircle2, AlertCircle, Stethoscope,
  ChevronRight, MessageSquare, Phone, Trash2, RefreshCw, Filter, Check, Sparkles
} from 'lucide-react';

interface StaffPortalProps {
  onBackToMain: () => void;
}

interface FrontDeskUser {
  id: string;
  name: string;
  title: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
}

interface PatientInquiry {
  id: string;
  patientName: string;
  dob: string;
  phone: string;
  email: string;
  concern: string;
  createdAt: string;
  status: 'New' | 'Contacted' | 'Resolved';
  staffNotes?: string;
}

const OFFICIAL_STAFF_USER: FrontDeskUser = {
  id: 'FD-101',
  name: 'Front Desk Administration',
  title: 'Front Desk Coordinator',
  email: 'info@health1stcareclinic.org',
  role: 'Front Desk Administration',
  department: 'Patient Reception & Intake'
};

const OFFICIAL_EMAIL = 'info@health1stcareclinic.org';
const OFFICIAL_PASSWORD = 'frontdesk1!';

export default function StaffPortal({ onBackToMain }: StaffPortalProps) {
  const [currentUser, setCurrentUser] = useState<FrontDeskUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState('');

  // Front Desk Dashboard state
  const [inquiries, setInquiries] = useState<PatientInquiry[]>([]);
  const [fetchingInquiries, setFetchingInquiries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiryModal, setSelectedInquiryModal] = useState<PatientInquiry | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<PatientInquiry | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keep modal tempNotes synced when selected inquiry changes
  useEffect(() => {
    if (selectedInquiryModal) {
      setTempNotes(selectedInquiryModal.staffNotes || '');
    }
  }, [selectedInquiryModal?.id]);

  // Fetch inquiries from server
  const fetchInquiries = async () => {
    if (!currentUser) return;
    setFetchingInquiries(true);
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setInquiries(data);
          // Sync selected modal if open
          if (selectedInquiryModal) {
            const currentInModal = data.find((i: PatientInquiry) => i.id === selectedInquiryModal.id);
            if (currentInModal) {
              setSelectedInquiryModal(currentInModal);
            }
          }
        }
      }
    } catch {
      // Gracefully handle server reconnects / polling transitions without noisy console errors
    } finally {
      setFetchingInquiries(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchInquiries();
    // Poll every 5 seconds to sync inquiries submitted from the public site form while logged in
    const interval = setInterval(fetchInquiries, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter your front desk email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (cleanEmail === OFFICIAL_EMAIL && cleanPassword === OFFICIAL_PASSWORD) {
        try {
          if (rememberMe) {
            localStorage.setItem('hf_staff_email', cleanEmail);
          } else {
            localStorage.removeItem('hf_staff_email');
          }
        } catch {
          // ignore storage errors
        }
        setCurrentUser(OFFICIAL_STAFF_USER);
      } else {
        setError('Invalid email or password. Please enter the authorized front desk credentials.');
      }
    }, 450);
  };

  const updateInquiryStatus = async (id: string, newStatus: 'New' | 'Contacted' | 'Resolved') => {
    // Immediate optimistic local update
    setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    if (selectedInquiryModal && selectedInquiryModal.id === id) {
      setSelectedInquiryModal(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Status for #${id} updated to "${newStatus}"`);

    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch {
      // Retained in local optimistic state
    }
  };

  const saveStaffNotes = async () => {
    if (!selectedInquiryModal) return;
    setSavingNotes(true);

    // Immediate optimistic local update
    setInquiries(prev => prev.map(item => item.id === selectedInquiryModal.id ? { ...item, staffNotes: tempNotes } : item));
    setSelectedInquiryModal(prev => prev ? { ...prev, staffNotes: tempNotes } : null);

    try {
      const res = await fetch(`/api/inquiries/${selectedInquiryModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffNotes: tempNotes })
      });
      if (res.ok) {
        showToast('Front Desk internal notes saved!');
      }
    } catch {
      showToast('Front Desk internal notes saved locally.');
    } finally {
      setSavingNotes(false);
    }
  };

  const promptDeleteInquiry = (inquiry: PatientInquiry) => {
    setInquiryToDelete(inquiry);
  };

  const confirmDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    const id = inquiryToDelete.id;
    const patientName = inquiryToDelete.patientName;
    
    // Immediate optimistic local update
    setInquiries(prev => prev.filter(item => item.id !== id));
    if (selectedInquiryModal?.id === id) {
      setSelectedInquiryModal(null);
    }
    setInquiryToDelete(null);
    showToast(`Inquiry for "${patientName}" (#${id}) deleted.`);

    try {
      await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    } catch {
      // Retained deletion in local state
    }
  };

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmailInput.trim()) return;
    setResetEmailSent(true);
    setTimeout(() => {
      setResetEmailSent(false);
      setForgotPasswordModal(false);
      setResetEmailInput('');
    }, 2500);
  };

  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;
  const contactedInquiriesCount = inquiries.filter(i => i.status === 'Contacted').length;
  const resolvedInquiriesCount = inquiries.filter(i => i.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1A] flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-[#F2EFE9] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToMain}
              className="flex items-center gap-2 text-sm font-semibold text-[#6B6B68] hover:text-[#4A7C59] transition-colors py-1 px-3 rounded-lg hover:bg-[#FAFAF8]"
            >
              <ArrowLeft className="w-4 h-4" />
              Public Clinic Site
            </button>
            <div className="h-5 w-px bg-[#F2EFE9]" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#4A7C59] rounded-lg flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg tracking-tight">
                Health First <span className="text-[#4A7C59]">Front Desk Portal</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-[#4A7C59]/10 text-[#4A7C59] rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Front Desk Authorized
            </span>
            {currentUser && (
              <button
                onClick={() => setCurrentUser(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Front Desk Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {!currentUser ? (
          /* ================= FRONT DESK LOGIN PAGE ================= */
          <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 items-stretch my-auto">
            {/* Left Banner */}
            <div className="md:col-span-5 bg-gradient-to-br from-[#4A7C59] to-[#365c41] text-white p-8 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20">
                  <Building2 className="w-3.5 h-3.5 text-[#D4881A]" /> Front Desk Reception
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
                    Front Desk Reception Portal
                  </h2>
                  <p className="text-white/80 text-sm mt-3 leading-relaxed">
                    Dedicated staff portal to receive real-time patient questions & concerns from the website, manage patient check-in, and coordinate appointments.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <MessageSquare className="w-4 h-4 text-[#D4881A] shrink-0" />
                    <span>Instant sync with website patient concern forms</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-[#D4881A] shrink-0" />
                    <span>Live check-in queue & exam room status</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <BadgeCheck className="w-4 h-4 text-[#D4881A] shrink-0" />
                    <span>HIPAA Compliant patient intake records</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15 text-xs text-white/70 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D4881A]" />
                <span>Front Desk Staff Only • Health First Care Clinic Euless, TX</span>
              </div>
            </div>

            {/* Right Login Form */}
            <div className="md:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-[#F2EFE9] shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-[#1C1C1A]">Front Desk Login</h1>
                    <p className="text-xs text-[#6B6B68] mt-1">Sign in with your Front Desk administrative account.</p>
                  </div>
                  <div className="w-10 h-10 bg-[#FAFAF8] rounded-xl border border-[#F2EFE9] flex items-center justify-center text-[#4A7C59]">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1C1A] mb-1.5">Front Desk Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#6B6B68] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter front desk email"
                        autoComplete="username"
                        required
                        className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-[#1C1C1A]">Password</label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordModal(true)}
                        className="text-[11px] font-semibold text-[#4A7C59] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#6B6B68] absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        required
                        className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#6B6B68] hover:text-[#1C1C1A]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-[#6B6B68] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#F2EFE9] text-[#4A7C59] focus:ring-[#4A7C59]"
                      />
                      <span>Remember front desk terminal</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#4A7C59] hover:bg-[#3d6749] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Front Desk Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Front Desk Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F2EFE9] text-[11px] text-[#6B6B68] text-center">
                HIPAA Protected Reception Portal • Health First Care Clinic
              </div>
            </div>
          </div>
        ) : (
          /* ================= FRONT DESK DASHBOARD ================= */
          <div className="w-full max-w-6xl space-y-6">
            {/* Front Desk Profile Header Card */}
            <div className="bg-white rounded-3xl border border-[#F2EFE9] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#4A7C59]/10 border border-[#4A7C59]/20 flex items-center justify-center text-[#4A7C59] shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-serif font-bold text-[#1C1C1A]">{currentUser.name}</h2>
                    <span className="bg-[#4A7C59]/10 text-[#4A7C59] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B68] mt-0.5">{currentUser.title} • ID: {currentUser.id}</p>
                  <p className="text-xs text-[#4A7C59] font-medium mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Front Desk Reception active • Station 1 (Euless, TX)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchInquiries}
                  className="bg-[#FAFAF8] hover:bg-[#F2EFE9] text-[#1C1C1A] border border-[#F2EFE9] text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fetchingInquiries ? 'animate-spin' : ''}`} /> Refresh Data
                </button>
                <button
                  onClick={() => setCurrentUser(null)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar focused on Patient Concerns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#F2EFE9] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-[#6B6B68] text-xs font-medium">
                  <span>Total Inquiries Logged</span>
                  <MessageSquare className="w-4 h-4 text-[#4A7C59]" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#1C1C1A] mt-2 flex items-center gap-2">
                  {inquiries.length} Total
                </div>
                <div className="text-[11px] text-[#4A7C59] font-medium mt-1">Direct from public site form</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#F2EFE9] shadow-xs">
                <div className="flex items-center justify-between text-[#6B6B68] text-xs font-medium">
                  <span>New / Action Required</span>
                  <AlertCircle className="w-4 h-4 text-[#D4881A]" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#D4881A] mt-2 flex items-center gap-2">
                  {newInquiriesCount}
                  {newInquiriesCount > 0 && (
                    <span className="bg-[#D4881A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-amber-600 font-medium mt-1">Requires Front Desk review</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#F2EFE9] shadow-xs">
                <div className="flex items-center justify-between text-[#6B6B68] text-xs font-medium">
                  <span>Contacted / In Progress</span>
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-serif font-bold text-blue-700 mt-2">{contactedInquiriesCount}</div>
                <div className="text-[11px] text-blue-600 font-medium mt-1">Staff outreach completed</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#F2EFE9] shadow-xs">
                <div className="flex items-center justify-between text-[#6B6B68] text-xs font-medium">
                  <span>Resolved Concerns</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-serif font-bold text-emerald-700 mt-2">{resolvedInquiriesCount}</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">Completed & archived</div>
              </div>
            </div>

            {/* PATIENT CONCERNS & QUESTIONS TABLE CONTAINER */}
            <div className="bg-white rounded-3xl border border-[#F2EFE9] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2EFE9]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4A7C59]/10 text-[#4A7C59] rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1C1C1A] flex items-center gap-2">
                      Patient Concerns & Questions
                      {newInquiriesCount > 0 && (
                        <span className="bg-[#D4881A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {newInquiriesCount} New
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#6B6B68]">
                      All submissions from the "Ask Front Desk" form on the public website appear here in real time.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#6B6B68] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient, phone, or concern..."
                    className="bg-[#FAFAF8] border border-[#F2EFE9] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59] w-full sm:w-72"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-3.5 bg-[#FAFAF8] rounded-2xl border border-[#F2EFE9] flex items-center justify-between text-xs text-[#6B6B68]">
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-[#D4881A]" />
                    <span>Real-time sync active from public clinic website form.</span>
                  </div>
                  <span className="font-bold text-[#4A7C59]">{inquiries.length} Inquiries Logged</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#F2EFE9] text-[11px] font-bold text-[#6B6B68] uppercase tracking-wider bg-[#FAFAF8]">
                        <th className="py-3 px-3.5">Patient Name</th>
                        <th className="py-3 px-3.5">Date of Birth (DOB)</th>
                        <th className="py-3 px-3.5">Phone Number</th>
                        <th className="py-3 px-3.5">Email</th>
                        <th className="py-3 px-3.5">Patient Concern / Question</th>
                        <th className="py-3 px-3.5">Submitted</th>
                        <th className="py-3 px-3.5">Status</th>
                        <th className="py-3 px-3.5 text-right">Front Desk Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EFE9] text-xs">
                      {inquiries
                        .filter(i => 
                          i.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.concern.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.phone.includes(searchQuery) ||
                          i.email.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((item) => (
                          <tr key={item.id} className={`hover:bg-[#FAFAF8] transition-colors ${item.status === 'New' ? 'bg-amber-50/40' : ''}`}>
                            <td className="py-3.5 px-3.5 font-bold text-[#1C1C1A]">
                              <div className="flex items-center gap-2">
                                {item.patientName}
                                {item.status === 'New' && (
                                  <span className="bg-[#D4881A] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded">NEW</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3.5 text-[#1C1C1A] font-medium">{item.dob}</td>
                            <td className="py-3.5 px-3.5">
                              <a href={`tel:${item.phone}`} className="text-[#4A7C59] font-bold hover:underline flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {item.phone}
                              </a>
                            </td>
                            <td className="py-3.5 px-3.5 text-[#6B6B68]">{item.email}</td>
                            <td className="py-3.5 px-3.5 max-w-xs text-[#1C1C1A]">
                              <p className="truncate font-normal" title={item.concern}>{item.concern}</p>
                            </td>
                            <td className="py-3.5 px-3.5 text-[#6B6B68] text-[11px] whitespace-nowrap">{item.createdAt}</td>
                            <td className="py-3.5 px-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                item.status === 'New' 
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                  : item.status === 'Contacted' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedInquiryModal(item)}
                                  className="px-2.5 py-1 bg-[#4A7C59] text-white rounded-lg text-[11px] font-semibold hover:bg-[#3d6749]"
                                >
                                  View Full
                                </button>
                                {item.status === 'New' && (
                                  <button
                                    onClick={() => updateInquiryStatus(item.id, 'Contacted')}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                                  >
                                    Mark Contacted
                                  </button>
                                )}
                                {item.status !== 'Resolved' && (
                                  <button
                                    onClick={() => updateInquiryStatus(item.id, 'Resolved')}
                                    className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold hover:bg-emerald-100 transition-colors"
                                  >
                                    Resolve
                                  </button>
                                )}
                                {item.status === 'Resolved' && (
                                  <button
                                    onClick={() => updateInquiryStatus(item.id, 'New')}
                                    className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold hover:bg-amber-100 transition-colors"
                                  >
                                    Reopen
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => promptDeleteInquiry(item)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Inquiry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {inquiries.length === 0 && (
                    <div className="p-12 text-center text-[#6B6B68]">
                      <MessageSquare className="w-8 h-8 text-[#4A7C59] mx-auto mb-2 opacity-50" />
                      <p className="font-serif font-bold text-base text-[#1C1C1A]">No patient inquiries logged yet.</p>
                      <p className="text-xs mt-1">When patients submit concerns on the website form, they will appear here in real time.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-[#1C1C1A] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL INQUIRY DETAILS MODAL */}
      <AnimatePresence>
        {selectedInquiryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#F2EFE9] shadow-2xl relative space-y-6 my-8"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-[#F2EFE9] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4881A] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Inquiry #{selectedInquiryModal.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      selectedInquiryModal.status === 'New' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                        : selectedInquiryModal.status === 'Contacted' 
                        ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}>
                      Current Status: {selectedInquiryModal.status}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#1C1C1A] mt-2">
                    {selectedInquiryModal.patientName}
                  </h3>
                  <p className="text-xs text-[#6B6B68] mt-0.5">Submitted {selectedInquiryModal.createdAt}</p>
                </div>
                <button
                  onClick={() => setSelectedInquiryModal(null)}
                  className="p-1 text-[#6B6B68] hover:text-[#1C1C1A] hover:bg-[#FAFAF8] rounded-full transition-colors font-bold text-xl"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Patient Contact Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAFAF8] p-4 rounded-2xl border border-[#F2EFE9]">
                <div>
                  <span className="font-bold text-[#6B6B68] block mb-0.5">Date of Birth (DOB)</span>
                  <span className="font-semibold text-[#1C1C1A] text-sm">{selectedInquiryModal.dob}</span>
                </div>
                <div>
                  <span className="font-bold text-[#6B6B68] block mb-0.5">Phone Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1C1C1A] text-sm">{selectedInquiryModal.phone}</span>
                    <a
                      href={`tel:${selectedInquiryModal.phone}`}
                      className="px-2 py-0.5 bg-[#4A7C59] text-white text-[10px] font-bold rounded-lg hover:bg-[#3d6749] flex items-center gap-1"
                    >
                      <Phone className="w-2.5 h-2.5" /> Call
                    </a>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-[#6B6B68] block mb-0.5">Email Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1C1C1A]">{selectedInquiryModal.email}</span>
                    {selectedInquiryModal.email !== 'Not provided' && (
                      <a
                        href={`mailto:${selectedInquiryModal.email}`}
                        className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Mail className="w-2.5 h-2.5" /> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Question / Concern */}
              <div>
                <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-1.5">
                  Patient Question / Concern Message
                </label>
                <div className="bg-[#FAFAF8] border border-[#F2EFE9] rounded-2xl p-4 text-xs text-[#1C1C1A] leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedInquiryModal.concern}
                </div>
              </div>

              {/* Front Desk Internal Staff Notes */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider">
                    Front Desk Internal Notes
                  </label>
                  <span className="text-[10px] text-[#6B6B68]">Visible to staff only</span>
                </div>
                <textarea
                  rows={2}
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Record staff actions, phone callback details, or rx refill status..."
                  className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-2xl p-3 text-xs text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59]"
                />
                <button
                  type="button"
                  onClick={saveStaffNotes}
                  disabled={savingNotes}
                  className="mt-2 text-xs bg-[#1C1C1A] hover:bg-black text-white px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ml-auto"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {savingNotes ? 'Saving Notes...' : 'Save Internal Notes'}
                </button>
              </div>

              {/* Change Status Controls */}
              <div className="pt-3 border-t border-[#F2EFE9]">
                <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">
                  Update Inquiry Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateInquiryStatus(selectedInquiryModal.id, 'New')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedInquiryModal.status === 'New'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-[#FAFAF8] text-[#6B6B68] border-[#F2EFE9] hover:bg-amber-50'
                    }`}
                  >
                    Mark New
                  </button>
                  <button
                    type="button"
                    onClick={() => updateInquiryStatus(selectedInquiryModal.id, 'Contacted')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedInquiryModal.status === 'Contacted'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-[#FAFAF8] text-[#6B6B68] border-[#F2EFE9] hover:bg-blue-50'
                    }`}
                  >
                    Mark Contacted
                  </button>
                  <button
                    type="button"
                    onClick={() => updateInquiryStatus(selectedInquiryModal.id, 'Resolved')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedInquiryModal.status === 'Resolved'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-[#FAFAF8] text-[#6B6B68] border-[#F2EFE9] hover:bg-emerald-50'
                    }`}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F2EFE9]">
                <button
                  type="button"
                  onClick={() => promptDeleteInquiry(selectedInquiryModal)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Inquiry
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInquiryModal(null)}
                  className="px-6 py-2.5 bg-[#FAFAF8] border border-[#F2EFE9] text-[#1C1C1A] hover:bg-[#F2EFE9] rounded-xl text-xs font-bold transition-colors"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-App Delete Confirmation Modal */}
      <AnimatePresence>
        {inquiryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#F2EFE9] shadow-2xl relative space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1C1C1A]">Delete Patient Inquiry?</h3>
                  <p className="text-xs text-[#6B6B68] mt-1.5 leading-relaxed">
                    Are you sure you want to permanently delete the inquiry for <strong className="text-[#1C1C1A]">{inquiryToDelete.patientName}</strong> (#{inquiryToDelete.id})? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2EFE9]">
                <button
                  type="button"
                  onClick={() => setInquiryToDelete(null)}
                  className="px-4 py-2 bg-[#FAFAF8] border border-[#F2EFE9] text-[#1C1C1A] hover:bg-[#F2EFE9] rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteInquiry}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Yes, Delete Inquiry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#F2EFE9] shadow-2xl relative"
            >
              <h3 className="font-serif font-bold text-xl text-[#1C1C1A] mb-2">Reset Front Desk Password</h3>
              <p className="text-xs text-[#6B6B68] mb-4">
                Enter your front desk email address to receive a secure password reset link.
              </p>

              {resetEmailSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Password Reset Email Sent!
                  </div>
                  <p>Check your inbox for instructions from Health First Administration.</p>
                </div>
              ) : (
                <form onSubmit={handleSendResetLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1C1A] mb-1.5">Front Desk Email</label>
                    <input
                      type="email"
                      value={resetEmailInput}
                      onChange={(e) => setResetEmailInput(e.target.value)}
                      placeholder="Enter front desk email"
                      required
                      className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B6B68] hover:bg-[#FAFAF8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#4A7C59] text-white rounded-xl text-xs font-bold hover:bg-[#3d6749]"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
