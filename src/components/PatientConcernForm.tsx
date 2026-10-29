import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, User, Calendar, Phone, Mail, MessageSquare, ShieldCheck, HeartPulse } from 'lucide-react';

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwPPfH558DKptrk8Ir24eAVZkikRyzgF7U57zpx-Tiu6G_MOlko2EmxNY1c0NCmo3zZRw/exec";

export default function PatientConcernForm() {
  const [patientName, setPatientName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    // Validate required fields
    if (!patientName.trim() || !phone.trim() || !concern.trim()) {
      setError('Please provide your name, phone number, and question or concern.');
      return;
    }

    setLoading(true);

    try {
      // 1. Submit to Clinic Staff Portal Backend API
      const staffPortalPromise = fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: patientName.trim(),
          dob: dob.trim(),
          phone: phone.trim(),
          email: email.trim(),
          concern: concern.trim(),
        }),
      });

      // 2. Submit to Google Sheet via Google Apps Script
      const body = new URLSearchParams();
      body.append("patientName", patientName.trim());
      body.append("dateOfBirth", dob.trim());
      body.append("phoneNumber", phone.trim());
      body.append("emailAddress", email.trim());
      body.append("message", concern.trim());

      const googleSheetPromise = fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: body.toString(),
      });

      // Await both submissions
      const [staffRes, sheetRes] = await Promise.allSettled([
        staffPortalPromise,
        googleSheetPromise,
      ]);

      const staffOk = staffRes.status === 'fulfilled' && staffRes.value.ok;
      const sheetOk = sheetRes.status === 'fulfilled' && sheetRes.value.ok;

      // As long as either the staff portal or sheet recorded it, succeed
      if (staffOk || sheetOk) {
        setShowThankYouModal(true);
        setPatientName('');
        setDob('');
        setPhone('');
        setEmail('');
        setConcern('');
      } else {
        throw new Error('We were unable to submit your message. Please try again.');
      }
    } catch {
      setError('We were unable to submit your message. Please try again or call our front desk directly at (817) 345-6443.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="patient-concern" className="py-20 px-6 bg-gradient-to-b from-[#FAFAF8] to-white border-t border-[#F2EFE9]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] text-xs font-bold uppercase tracking-wider mb-4">
            <HeartPulse className="w-4 h-4" /> Direct Front Desk Contact
          </div>
          <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-serif font-bold text-[#1C1C1A] leading-tight mb-3">
            Have a Question or Concern?
          </h2>
          <p className="text-base text-[#6B6B68] leading-relaxed">
            Fill out the form below and your message will go directly to our Front Desk staff. We will review your request and reach out promptly.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#F2EFE9] shadow-xl p-8 sm:p-12 relative overflow-hidden">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
              <span className="font-bold">Notice:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6B6B68] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59] transition-colors"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">
                  Date of Birth (DOB)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#6B6B68] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59] transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6B6B68] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(817) 000-0000"
                    className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59] transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B6B68] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Concern / Message */}
            <div>
              <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">
                Your Question or Concern <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-[#6B6B68] absolute left-3.5 top-3.5" />
                <textarea
                  required
                  rows={4}
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  placeholder="Please describe your question, prescription refill request, or medical inquiry..."
                  className="w-full bg-[#FAFAF8] border border-[#F2EFE9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1C1C1A] focus:outline-none focus:border-[#4A7C59] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#6B6B68]">
                <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
                <span>Your information is encrypted and sent directly to our Front Desk.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#4A7C59] hover:bg-[#3d6749] text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting to Front Desk...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Staff</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* THANK YOU POPUP MODAL */}
      <AnimatePresence>
        {showThankYouModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#F2EFE9] shadow-2xl text-center space-y-5 relative"
            >
              <div className="w-16 h-16 bg-[#4A7C59]/10 rounded-3xl flex items-center justify-center text-[#4A7C59] mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-[#1C1C1A] mb-2">Thank You!</h3>
                <p className="text-sm text-[#6B6B68] leading-relaxed">
                  Thank you. Your question or concern has been submitted successfully. Our staff will review your message and follow up as needed.
                </p>
              </div>

              <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#F2EFE9] text-xs text-[#4A7C59] font-medium">
                Need immediate help? Call our clinic reception directly at <strong className="font-bold">(817) 345-6443</strong>.
              </div>

              <button
                onClick={() => setShowThankYouModal(false)}
                className="w-full bg-[#4A7C59] hover:bg-[#3d6749] text-white font-bold py-3 rounded-2xl transition-all shadow-md text-sm"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
