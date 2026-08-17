/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, Calendar, Clock, Star, MapPin, 
  ChevronDown, HeartPulse, Activity, ShieldPlus, 
  Stethoscope, CheckCircle2, Menu, X, ArrowRight,
  Syringe, FlaskConical, Thermometer, MessageSquare, Send, Bot, Loader2, User, Sparkles, Lock
} from 'lucide-react';
import StaffPortal from './components/StaffPortal';
import PatientConcernForm from './components/PatientConcernForm';

const AnimatedCounter = ({ end, suffix = "", duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration, hasStarted]);

  return (
    <motion.span 
      onViewportEnter={() => setHasStarted(true)}
      viewport={{ once: true }}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
};

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-[#D4881A] text-white hover:bg-[#b87616] shadow-lg shadow-amber-900/10",
    secondary: "border-2 border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59] hover:text-white bg-transparent",
    outline: "border border-[#F2EFE9] bg-white text-[#1C1C1A] hover:bg-[#F2EFE9]"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'staff'>('home');
  
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (currentView === 'staff') {
    return <StaffPortal onBackToMain={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1A] font-sans selection:bg-[#4A7C59] selection:text-white">
      {/* 1. STICKY NAV */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navScrolled ? 'bg-white/80 backdrop-blur-md border-b border-[#F2EFE9] py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4A7C59] rounded-xl flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">Health First <span className="text-[#4A7C59]">Care Clinic</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-[#6B6B68]">
            <a href="#services" className="hover:text-[#4A7C59] transition-colors">Services</a>
            <a href="#about" className="hover:text-[#4A7C59] transition-colors">About Us</a>
            <a href="#testimonials" className="hover:text-[#4A7C59] transition-colors">Patient Info</a>
            <a href="#patient-concern" className="hover:text-[#4A7C59] transition-colors">Ask Front Desk</a>
            <a href="#contact" className="hover:text-[#4A7C59] transition-colors">Contact</a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setCurrentView('staff')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B68] hover:text-[#4A7C59] bg-white hover:bg-[#F2EFE9] border border-[#F2EFE9] px-3.5 py-2.5 rounded-full transition-all shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5 text-[#4A7C59]" /> Staff Portal
            </button>
            <a href="tel:8173456443" className="flex items-center gap-2 font-semibold text-[#4A7C59] hover:opacity-80 transition-opacity text-sm">
              <Phone className="w-4 h-4" />
              (817) 345 6443
            </a>
            <a href="https://mycw148.ecwcloud.com/portal20858/jsp/100mp/login_otp.jsp" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="py-2.5 text-sm">Book Appointment</Button>
            </a>
          </div>

          <button className="lg:hidden p-2 text-[#1C1C1A]" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-[#FAFAF8] p-6 lg:hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-serif font-bold tracking-tight">Health First <span className="text-[#4A7C59]">Care Clinic</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex flex-col gap-6 text-2xl font-serif font-medium mb-auto">
              <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Patient Info</a>
              <a href="#patient-concern" onClick={() => setMobileMenuOpen(false)}>Ask Front Desk</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <button 
                onClick={() => { setMobileMenuOpen(false); setCurrentView('staff'); }}
                className="text-left text-[#4A7C59] flex items-center gap-2"
              >
                <Lock className="w-6 h-6" /> Staff Portal
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <a href="https://mycw148.ecwcloud.com/portal20858/jsp/100mp/login_otp.jsp" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">Book Appointment</Button>
              </a>
              <a href="tel:8173456443" className="flex justify-center items-center gap-2 py-4 font-semibold text-[#4A7C59]">
                <Phone className="w-5 h-5" /> (817) 345 6443
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 flex flex-col gap-8"
          >
            <div className="inline-flex max-w-max items-center gap-2 px-4 py-1.5 bg-[#4A7C59]/10 text-[#4A7C59] rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-[#4A7C59] rounded-full animate-pulse"></span>
              Accepting New Patients in Euless, TX
            </div>
            <h1 className="text-[clamp(2.8rem,5vw,4.2rem)] leading-[1.05] tracking-tight font-serif text-[#1C1C1A]">
              Your Health, Our Priority — Primary Care That <span className="italic text-[#4A7C59]">Feels Like Family.</span>
            </h1>
            <p className="text-lg text-[#6B6B68] max-w-xl leading-[1.75]">
              Same-day appointments, compassionate doctors, and care that actually listens. Serving Euless since 2015.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://mycw148.ecwcloud.com/portal20858/jsp/100mp/login_otp.jsp" target="_blank" rel="noopener noreferrer"><Button>Book Your Appointment</Button></a>
              <a href="tel:8173456443"><Button variant="secondary">Call Us Now — (817) 345 6443</Button></a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#4A7C59] pt-4">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Accepting new patients</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Most insurance accepted</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Same-day & telehealth</span>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-[4/5] bg-gradient-to-tr from-[#F2EFE9] to-[#FAFAF8] border border-[#F2EFE9] rounded-[2rem] overflow-hidden shadow-2xl relative flex items-center justify-center">
              <img src="https://drive.google.com/thumbnail?id=1UriT-qE5rnLaAeBp-3P42DtdSrYSL-Sj&sz=w1000" alt="Health First Care Clinic" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {/* Floating Wait Time Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex items-center justify-between border border-[#F2EFE9]"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#6B6B68] uppercase tracking-wider">Average Wait Time</span>
                  <span className="text-2xl font-serif font-bold text-[#1C1C1A]">Under <AnimatedCounter end={15} /> mins</span>
                </div>
                <div className="h-10 w-10 bg-[#4A7C59]/10 rounded-full flex items-center justify-center text-[#4A7C59]">
                  <Clock className="w-5 h-5" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <AnimatePresence>
        {navScrolled && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#F2EFE9] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 lg:hidden flex gap-3"
          >
            <a href="tel:8173456443" className="flex-1">
              <Button variant="secondary" className="w-full text-sm py-2">Call Now</Button>
            </a>
            <a href="https://mycw148.ecwcloud.com/portal20858/jsp/100mp/login_otp.jsp" target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="primary" className="w-full text-sm py-2">Book Wait-Free</Button>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SOCIAL PROOF BAR */}
      <section className="bg-[#4A7C59] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-4xl font-serif font-bold"><AnimatedCounter end={4200} suffix="+" /></span>
            <span className="text-sm text-white/80 uppercase tracking-wider">Patients Served</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-4xl font-serif font-bold"><AnimatedCounter end={4.9} duration={1} />★</span>
            <span className="text-sm text-white/80 uppercase tracking-wider">Google Rating</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-4xl font-serif font-bold"><AnimatedCounter end={15} suffix="+" /></span>
            <span className="text-sm text-white/80 uppercase tracking-wider">Years of Care</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-4xl font-serif font-bold"><AnimatedCounter end={98} suffix="%" /></span>
            <span className="text-sm text-white/80 uppercase tracking-wider">Would Recommend</span>
          </div>
        </div>
        <div className="text-center flex flex-col items-center justify-center gap-2 pt-8 border-t border-white/20">
          <div className="flex text-[#D4881A]">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="text-sm text-white/90">Based on 340+ authentic patient reviews.</p>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-serif font-bold leading-tight mb-4 text-[#1C1C1A]">Everything You Need Under One Roof</h2>
          <p className="text-lg text-[#6B6B68]">Comprehensive primary care tailored to you and your family.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <HeartPulse />, title: "Annual Physicals", desc: "Comprehensive exams, preventative screenings, and personalized health plans." },
            { icon: <Syringe />, title: "Vaccinations", desc: "Flu shots, routine immunizations, and travel vaccines available daily." },
            { icon: <Thermometer />, title: "Acute Illness", desc: "Same-day care for fevers, infections, minor injuries and sudden illnesses." },
            { icon: <Activity />, title: "Chronic Disease", desc: "Ongoing management for diabetes, hypertension, and asthma." },
            { icon: <Phone />, title: "Telehealth Visits", desc: "Consult with our doctors from the comfort of your own home via secure video." },
            { icon: <FlaskConical />, title: "Lab & Diagnostics", desc: "In-house bloodwork, EKGs, and rapid testing for quick results." },
          ].map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-[#F2EFE9] rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-[#FAFAF8] rounded-2xl flex items-center justify-center text-[#4A7C59] mb-6 group-hover:bg-[#4A7C59] group-hover:text-white transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold font-serif mb-3">{service.title}</h3>
              <p className="text-[#6B6B68] leading-relaxed mb-6">{service.desc}</p>
              <a href="https://mycw148.ecwcloud.com/portal20858/jsp/100mp/login_otp.jsp" target="_blank" rel="noopener noreferrer" className="text-[#D4881A] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section id="about" className="py-24 px-6 bg-[#F2EFE9]">
        <div className="max-w-7xl mx-auto space-y-24">
           {/* Block A */}
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <motion.div initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true}} className="bg-white rounded-[2rem] aspect-square flex items-center justify-center shadow-sm overflow-hidden border border-[#F2EFE9]">
                <img src="https://drive.google.com/thumbnail?id=1AIJBL_wFexWYZPO7kUP6tmZ9O3gxzI3P&sz=w1000" alt="Same-Day Appointments" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </motion.div>
             <motion.div initial={{opacity:0, x:20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
               <h3 className="text-3xl font-serif font-bold mb-4">Same-Day Appointments</h3>
               <p className="text-lg text-[#6B6B68] leading-relaxed">No 3-week waits. We know you can't plan when you get sick. Our schedule is intentionally designed to accommodate urgent needs so you get care exactly when you need it.</p>
             </motion.div>
           </div>
           {/* Block B */}
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <motion.div initial={{opacity:0, x:20}} whileInView={{opacity:1, x:0}} viewport={{once:true}} className="md:order-last bg-white rounded-[2rem] aspect-square flex items-center justify-center shadow-sm overflow-hidden border border-[#F2EFE9]">
                <img src="https://drive.google.com/thumbnail?id=1DFoOZ3Y4qlpsxHFteoBPW14QeBgFAo_n&sz=w1000" alt="Doctors Who Actually Listen" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </motion.div>
             <motion.div initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
               <h3 className="text-3xl font-serif font-bold mb-4">Doctors Who Actually Listen</h3>
               <p className="text-lg text-[#6B6B68] leading-relaxed">Our average visit length is 25 minutes, not 7 like national averages. We believe in taking the time to understand the whole person, not just treating a temporary symptom.</p>
             </motion.div>
           </div>
           {/* Block C */}
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <motion.div initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true}} className="bg-white rounded-[2rem] aspect-square flex items-center justify-center shadow-sm overflow-hidden border border-[#F2EFE9]">
                <img src="https://drive.google.com/thumbnail?id=1xIgnf68TSW0YvqO-dhsTLHI7t7dEClZ5&sz=w1000" alt="Care That Works Around Your Day" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </motion.div>
             <motion.div initial={{opacity:0, x:20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
              <h3 className="text-3xl font-serif font-bold mb-4">Care That Works Around Your Day</h3>
               <p className="text-lg text-[#6B6B68] leading-relaxed">Your health matters during business hours too. We offer convenient appointments from 8 AM to 5 PM, making it easier to prioritize your care while balancing work, family, and daily responsibilities.</p>
             </motion.div>
           </div>
        </div>
      </section>

      {/* 6. DOCTORS / TEAM */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-serif font-bold leading-tight mb-4">Meet Your Care Team</h2>
          <p className="text-lg text-[#6B6B68]">Board-certified physicians deeply committed to your well-being.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              name: "Paul Ooyi, FNP, NP", 
              shortName: "Paul Ooyi",
              spec: "Family Medicine", 
              quote: "We treat people, not just symptoms.",
              img: "https://drive.google.com/thumbnail?id=12IHFs493ZsRs8T3TxepDSeeEub_7nNYE&sz=w800"
            },
            { 
              name: "Nicolina Mboya, APRN, RN", 
              shortName: "Nicolina Mboya",
              spec: "Internal Medicine", 
              quote: "Preventative care is the greatest medicine.",
              img: "https://drive.google.com/thumbnail?id=1imcesk55vDHuy_LMnAotRtoIHwc2S44q&sz=w800"
            },
            { 
              name: "Dr. Imre Kocsis, DO", 
              shortName: "Dr. Kocsis",
              spec: "Pediatrics & FamilyCare", 
              quote: "Building trust is the first step to healing.",
              img: "https://drive.google.com/thumbnail?id=1aMW0q3hTP8EBXt_Tu48MUbssE3OwKvAG&sz=w800"
            },
            { 
              name: "Jordyn Hayes, APRN, CNP", 
              shortName: "Jordyn Hayes",
              spec: "Family Medicine", 
              quote: "Compassionate care focused on the whole person.",
              img: "https://drive.google.com/thumbnail?id=15oxwOXPQ3p8BWWoc3PdHvT8YVom0YLXD&sz=w800"
            },
            { 
              name: "Marites Panopio, APRN, RN", 
              shortName: "Marites Panopio",
              spec: "Advanced Practice Nursing", 
              quote: "Dedicated to patient-centered compassionate care.",
              img: "https://drive.google.com/thumbnail?id=1P57V5wH-VgkGYhbKkeRzQdZFhkGRPXT4&sz=w800"
            },
            { 
              name: "Toyosi Omole, NP", 
              shortName: "Toyosi Omole",
              spec: "Family Practice & Primary Care", 
              quote: "Empowering patients through compassionate individualized care.",
              img: "https://drive.google.com/thumbnail?id=1Pip55jCJV8VD3-LsPoDs9LT4jF9XLPid&sz=w800"
            }
          ].map((doc, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border border-[#F2EFE9] rounded-[2rem] overflow-hidden group flex flex-col"
            >
              <div className="h-64 bg-[#E8E6DF] flex flex-col items-center justify-end overflow-hidden pt-8">
                 <div className="w-56 h-56 bg-white rounded-t-full shadow-inner overflow-hidden flex items-center justify-center translate-y-4">
                    <img src={doc.img} alt={doc.name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                 </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-[#4A7C59] text-xs font-bold uppercase tracking-wider mb-2">{doc.spec}</p>
                <h3 className="text-2xl font-serif font-bold mb-4">{doc.name}</h3>
                <p className="italic text-[#6B6B68] mb-8 flex-1">"{doc.quote}"</p>
                <a href="https://mycw148.ecwcloud.com/portal20858/jsp/100mp/login_otp.jsp" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">Book with {doc.shortName}</Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. PATIENT TESTIMONIALS (GOOGLE REVIEWS) */}
      <section id="testimonials" className="py-24 overflow-hidden relative border-y border-[#F2EFE9] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#F2EFE9] shadow-sm mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="text-sm font-bold text-[#1C1C1A]">5.0 Star Rating on Google Reviews</span>
          </div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-serif font-bold">What Our Patients Say</h2>
          <p className="text-lg text-[#6B6B68] max-w-2xl mx-auto mt-2">Verified Google Reviews from patients at Health First Care Clinic.</p>
        </div>
        
        {/* Smooth Scrolling Marquee Container */}
        <div className="flex w-full overflow-hidden group">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
            className="flex gap-6 px-6"
            style={{ width: "max-content" }}
          >
            {/* Duplicate twice for seamless loop */}
            {[1, 2].map((loop) => (
              <React.Fragment key={loop}>
                {[
                  { 
                    name: "TerryP", 
                    meta: "Local Guide · 43 reviews · 29 photos",
                    date: "a month ago",
                    avatarBg: "bg-teal-700",
                    text: "I had my first appointment with APRN, CNP Jordyn Hayes today! And I'm going to love it here. I'm new to the area and having to transfer my care team closer to home. From the front desk and everyone in between meeting CNP Hayes, my experience was excellent! I'm not easily impressed and will fire an unaligned professional, expeditiously! No need here.\n\nI was pleasantly greeted. I didn't feel rushed. I was listened to and commended for the hard work I'm already doing to improve my own health and well being. I'm looking forward to a long relationship with this team!" 
                  },
                  { 
                    name: "Vivian Jones", 
                    meta: "1 review",
                    date: "a month ago",
                    avatarBg: "bg-pink-700",
                    text: "I cannot say enough good things about Health First Care Clinic and NP Nicolina. Their professionalism, expertise, and genuine concern for patients truly stand out. The clinic was spotless, the staff was friendly, and the level of care I received was excellent. I would confidently recommend them to family and friends" 
                  },
                  { 
                    name: "Elimey Piloto García", 
                    meta: "Local Guide · 16 reviews",
                    date: "4 months ago",
                    avatarBg: "bg-amber-700",
                    text: "I wanted to take a moment to write a very good review of this place. Dr Nicolina Mboya is a wonderful human being who demonstrates great professionalism and patience, explaining every detail to the patient. I would also like to thanks the team; the clinic's customer service staff are excellent at what they do. I highly recommend this place if you are looking for exactly what you need. Great service!!! Nicolina Mboya and team! THANKS!!" 
                  },
                  { 
                    name: "Aastha Kc", 
                    meta: "Local Guide · 17 reviews",
                    date: "Edited 6 months ago",
                    avatarBg: "bg-indigo-700",
                    text: "NP Nicolina is hands down the best primary care provider I've ever had. She is incredibly knowledgeable, compassionate, and truly listens without ever making you feel rushed. She takes the time to explain everything clearly and makes sure all concerns are addressed, which makes such a difference in care.\n\nShe genuinely advocates for her patients and goes above and beyond to ensure the best outcomes. You can tell she truly cares, and that level of dedication is rare. I feel confident, heard, and well cared for every time I see her. Highly recommend NP Nicolina to anyone looking for an exceptional PCP." 
                  },
                  { 
                    name: "Lesley", 
                    meta: "Local Guide · 20 reviews · 9 photos",
                    date: "2 months ago",
                    avatarBg: "bg-emerald-700",
                    text: "First visit by recommendations with MBoya , and her staff was 10/10. Everyone is very professional, kind, and friendly . She has great bedside manners , and she's very knowledgeable , and listens to her patients. Found my new NP!" 
                  }
                ].map((review, idx) => (
                  <div 
                    key={idx}
                    className="w-[340px] md:w-[400px] shrink-0 bg-white p-6 rounded-2xl border border-[#F2EFE9] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${review.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0`}>
                            {review.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-sm text-[#1C1C1A] leading-tight flex items-center gap-1">
                              {review.name}
                            </h4>
                            <p className="text-[11px] text-[#6B6B68]">{review.meta}</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-[#D4881A]">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-[#6B6B68] font-medium">• {review.date}</span>
                      </div>

                      <p className="text-sm text-[#1C1C1A] leading-relaxed whitespace-pre-line text-left line-clamp-6">
                        {review.text}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs text-[#6B6B68]">
                      <span className="flex items-center gap-1 font-medium text-[#4A7C59]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C59]" /> Verified Google Review
                      </span>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 8. BOOK APPOINTMENT SECTION */}
      <section id="book" className="py-24 px-6 bg-[#4A7C59] text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-serif font-bold mb-4">Ready to Feel Better?</h2>
            <p className="text-xl text-white/80">Book your appointment online through our secure patient portal.</p>
          </div>

          <div className="bg-white text-[#1C1C1A] p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#4A7C59]/10 rounded-full flex items-center justify-center text-[#4A7C59] mb-6">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-[#1C1C1A] mb-4">Book with healow</h3>
            <p className="text-lg text-[#6B6B68] mb-8 max-w-lg">
              We've partnered with healow to provide you with a seamless scheduling experience. Existing and new patients can book instantly.
            </p>
            <a href="https://mycw148.ecwcloud.com/portal20858/jsp/100mp/login_otp.jsp" target="_blank" rel="noopener noreferrer">
              <Button className="py-4 text-xl px-12 shadow-xl hover:scale-105 transition-transform duration-300">
                Go to Appointment Portal →
              </Button>
            </a>
            <p className="text-xs text-[#6B6B68] mt-3 font-medium">
              Please note: We do not accept Medicaid.
            </p>
            
            <div className="mt-8 pt-8 border-t border-[#F2EFE9] w-full text-center text-sm text-[#6B6B68] flex flex-col md:flex-row items-center justify-center gap-4">
              <span>Or call us directly: <a href="tel:8173456443" className="font-bold text-[#4A7C59] hover:underline">(817) 345 6443</a></span>
              <span className="hidden md:block">•</span>
              <span className="flex items-center gap-1"><ShieldPlus className="w-4 h-4 text-[#4A7C59]"/> Secure & HIPAA compliant.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. INSURANCE LOGO STRIP */}
      <section className="py-16 px-6 border-b border-[#F2EFE9] overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto text-center mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B6B68]">We Accept Most Major Insurance Plans</h2>
        </div>
        
        <div className="max-w-6xl mx-auto flex justify-center flex-wrap gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Blue Cross Blue Shield of Texas */}
          <div className="h-12 flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105" title="Blue Cross Blue Shield of Texas">
            <svg className="h-11 w-auto" viewBox="0 0 310 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 1. Cross Emblem */}
              <g id="cross-emblem">
                {/* Cross Base */}
                <path d="M 14 6 H 30 V 18 H 42 V 34 H 30 V 46 H 14 V 34 H 2 V 18 H 14 Z" fill="#0072CE"/>
                {/* Vitruvian Human Figure inside Circle */}
                <circle cx="22" cy="26" r="9.5" fill="none" stroke="white" strokeWidth="1.8"/>
                <circle cx="22" cy="20.5" r="1.5" fill="white"/>
                <path d="M 16.5 24.5 Q 22 22.5 27.5 24.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M 18.5 32 L 22 26.5 L 25.5 32" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </g>

              {/* 2. Shield Emblem */}
              <g id="shield-emblem">
                {/* Shield Body */}
                <path d="M 64 6 C 74 6 79 12 79 24 C 79 37 69 45 64 47 C 59 45 49 37 49 24 C 49 12 54 6 64 6 Z" fill="#0072CE"/>
                {/* Inner Shield Line */}
                <path d="M 64 9 C 71.5 9 75.5 14 75.5 24 C 75.5 34.5 67.5 41.5 64 43.5 C 60.5 41.5 52.5 34.5 52.5 24 C 52.5 14 56.5 9 64 9 Z" fill="none" stroke="white" strokeWidth="1.2"/>
                {/* Rod of Asclepius (Staff & Serpent) */}
                <line x1="64" y1="13" x2="64" y2="38" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M 60.5 17 C 67.5 19 67.5 24 64 26 C 60.5 28 60.5 33 67.5 35" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              </g>

              {/* 3. Text */}
              <text x="88" y="24" fill="#000000" fontSize="21" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-0.5">BlueCross BlueShield</text>
              <text x="88" y="44" fill="#1C1C1A" fontSize="18" fontWeight="300" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0">of Texas</text>
            </svg>
          </div>

          {/* Aetna */}
          <div className="h-12 flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105" title="Aetna">
            <svg className="h-9 w-auto" viewBox="0 0 165 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* CVS Health / Aetna Purple Heart */}
              <path 
                d="M 18 10 C 13.5 4.5 5 7 5 15.5 C 5 23.5 12 29.5 18 36 C 24 29.5 31 23.5 31 15.5 C 31 7 22.5 4.5 18 10 Z" 
                fill="#7A2082" 
              />
              
              {/* "ætna" Text & Ligature */}
              <g fill="#7A2082">
                {/* 'a' part of 'æ' */}
                <path d="M 49 32 C 43 32 39 28 39 22 C 39 16 43 12 49 12 C 53 12 56 14 58 17 L 58 13 L 64 13 L 64 31 L 58 31 L 58 28 C 56 30.5 53 32 49 32 Z M 51 27 C 55 27 58 24.5 58 22 C 58 19.5 55 17 51 17 C 47 17 44.5 19.5 44.5 22 C 44.5 24.5 47 27 51 27 Z" />
                
                {/* Connecting bar between 'a' and 'e' */}
                <rect x="58" y="20" width="12" height="4.5" />
                
                {/* 'e' part of 'æ' */}
                <path d="M 74 32 C 67 32 63 27 63 22 C 63 16.5 67 12 74 12 C 81 12 84.5 16.5 84.5 22.5 L 84.5 24 L 68.5 24 C 69 27.5 71.5 28.5 74.5 28.5 C 77 28.5 79 27.5 80 26 L 84 28 C 82 30.5 78.5 32 74 32 Z M 74 15.5 C 71 15.5 69 17 68.5 20.5 L 79.5 20.5 C 79 17 77 15.5 74 15.5 Z" />
                
                {/* 't' with top curved hook */}
                <path d="M 91 31 L 86 31 L 86 16 L 82 16 L 82 12 L 86 12 L 87 6 C 89.5 6 92 7 94 8.5 L 94 12 L 98 12 L 98 16 L 94 16 L 94 27 C 94 29 95 29.5 97 29.5 L 98.5 29.5 L 98.5 31 Z" />
                
                {/* 'n' */}
                <path d="M 103 13 L 108.5 13 L 108.5 16 C 110.5 13.5 113.5 12 117.5 12 C 123 12 125.5 15.5 125.5 21 L 125.5 31 L 120 31 L 120 22 C 120 18.5 118.5 16.5 115.5 16.5 C 112 16.5 108.5 19 108.5 23 L 108.5 31 L 103 31 Z" />
                
                {/* 'a' */}
                <path d="M 137 32 C 131 32 127 28 127 22 C 127 16 131 12 137 12 C 141 12 144 14 146 17 L 146 13 L 151.5 13 L 151.5 31 L 146 31 L 146 28 C 144 30.5 141 32 137 32 Z M 139 27 C 143 27 146 24.5 146 22 C 146 19.5 143 17 139 17 C 135 17 132.5 19.5 132.5 22 C 132.5 24.5 135 27 139 27 Z" />
              </g>

              {/* ® Registered Trademark Circle */}
              <circle cx="157" cy="12" r="3.2" stroke="#7A2082" strokeWidth="0.9" fill="none" />
              <text x="155.2" y="14" fill="#7A2082" fontSize="4.5" fontWeight="bold" fontFamily="Arial, sans-serif">R</text>
            </svg>
          </div>

          {/* UnitedHealthcare */}
          <div className="h-12 flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105" title="UnitedHealthcare">
            <svg className="h-11 w-auto" viewBox="0 0 195 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* UnitedHealthcare Signature Swoosh "U" Icon */}
              <g fill="#002677">
                {/* Bar 1: Solid Left Pillar */}
                <path d="M 4 15 L 14 11 V 32 C 14 36.5 10.5 39 6.5 39 C 4.5 39 4 37.5 4 36 Z" />
                
                {/* Bar 2: First Concentric Swoosh */}
                <path d="M 7.5 41 C 12 41 18 37.5 18 32 V 9 L 22 7.5 V 32 C 22 39.5 14 43 7.5 43 Z" />
                
                {/* Bar 3: Second Concentric Swoosh */}
                <path d="M 9 C 14.5 45 25 41 25 32 V 5 L 29 3.5 V 32 C 29 43 16 47 9 47 Z" />
                
                {/* Bar 4: Third Outermost Concentric Swoosh */}
                <path d="M 10.5 49 C 17.5 49 32 44.5 32 32 V 1.5 L 36 0 V 32 C 36 46.5 19 51 10.5 51 Z" />
              </g>

              {/* Stacked Serif Typography */}
              <text x="44" y="21" fill="#002677" fontSize="20" fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="-0.4">United</text>
              <text x="44" y="42" fill="#002677" fontSize="20" fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="-0.4">Healthcare</text>

              {/* ® Registered Trademark Circle */}
              <circle cx="168" cy="30" r="2.8" stroke="#002677" strokeWidth="0.7" fill="none" />
              <text x="166.5" y="31.8" fill="#002677" fontSize="4" fontWeight="bold" fontFamily="Arial, sans-serif">R</text>
            </svg>
          </div>

          {/* Medicare */}
          <div className="h-12 flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105" title="Medicare">
            <svg className="h-8 w-auto" viewBox="0 0 170 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="15" stroke="#003366" strokeWidth="3" fill="none"/>
              <path d="M12 20C15 15 25 15 28 20C25 25 15 25 12 20Z" fill="#CC0000"/>
              <text x="42" y="26" fill="#003366" fontSize="20" fontWeight="bold" fontFamily="serif">Medicare</text>
            </svg>
          </div>

          {/* Cigna Healthcare */}
          <div className="h-12 flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105" title="Cigna Healthcare">
            <svg className="h-11 w-auto" viewBox="0 0 130 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Green leaf crown */}
              <path d="M31 2 C28 7 28 13 31 17 C34 13 34 7 31 2 Z" fill="#00CC33"/>
              <path d="M24 5 C20 9 19 15 23 19 C26 16 28 10 24 5 Z" fill="#00CC33"/>
              <path d="M38 5 C42 5 44 10 40 19 C36 15 35 9 38 5 Z" fill="#00CC33"/>
              <path d="M16 12 C12 15 10 21 14 24 C18 22 21 16 16 12 Z" fill="#00CC33"/>
              <path d="M46 12 C51 12 52 16 48 24 C42 21 40 15 46 12 Z" fill="#00CC33"/>
              <path d="M10 21 C6 22 4 27 8 30 C12 28 15 23 10 21 Z" fill="#00CC33"/>
              <path d="M52 21 C57 21 59 23 55 30 C50 27 48 22 52 21 Z" fill="#00CC33"/>
              
              {/* Blue dot above i */}
              <circle cx="31" cy="25" r="3.5" fill="#001CFF"/>

              {/* cigna text */}
              <text x="5" y="47" fill="#001CFF" fontSize="28" fontWeight="bold" fontFamily="Georgia, serif" letterSpacing="-1">cigna</text>
              
              {/* healthcare text */}
              <text x="50" y="58" fill="#001CFF" fontSize="10" fontWeight="600" fontFamily="Arial, sans-serif" letterSpacing="0">healthcare</text>
            </svg>
          </div>

          {/* Humana */}
          <div className="h-12 flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105" title="Humana">
            <svg className="h-8 w-auto" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="8" width="24" height="24" rx="4" fill="#78BE20"/>
              <path d="M8 14H12V26H8V14ZM18 14H22V26H18V14ZM12 18H18V22H12V18Z" fill="white"/>
              <text x="34" y="27" fill="#49A942" fontSize="22" fontWeight="bold" fontFamily="sans-serif">Humana</text>
            </svg>
          </div>

          {/* Tricare / Baylor Scott & White */}
          <div className="h-12 flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105" title="TRICARE">
            <svg className="h-8 w-auto" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L27 12V24L15 31L3 24V12L15 5Z" fill="#113366"/>
              <path d="M15 10L22 14V21L15 25L8 21V14L15 10Z" fill="#C41230"/>
              <text x="34" y="26" fill="#113366" fontSize="18" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">TRICARE</text>
            </svg>
          </div>
        </div>

        {/* Insurance Medicaid Notice */}
        <div className="max-w-2xl mx-auto mt-10 p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-center shadow-xs">
          <p className="text-sm text-[#1C1C1A] leading-relaxed">
            <strong className="font-bold text-[#D4881A]">Insurance Notice:</strong> Health First currently does not accept Medicaid plans. Please contact our office if you have questions about accepted insurance plans.
          </p>
        </div>

        <p className="text-center text-sm text-[#6B6B68] mt-6">
          Don't see yours listed? <a href="tel:8173456443" className="text-[#4A7C59] font-bold hover:underline">Call us at (817) 345-6443 — we accept many other plans!</a>
        </p>
      </section>

      {/* 10. FAQ SECTION */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-[clamp(2rem,4vw,3rem)] font-serif font-bold text-center mb-12">Got Questions? We've Got Answers.</h2>
        <div className="space-y-4">
          {[
            { q: "Are you accepting new patients?", a: "Yes, we are currently welcoming new patients from Euless and the surrounding areas. We often have same-day or next-day availability." },
            { q: "Do you offer same-day appointments?", a: "Absolutely. We reserve specific blocks in our schedule every day for sick visits and urgent needs. Call early in the day for the best availability." },
            { q: "What insurance plans do you accept?", a: "We accept Medicare and most major commercial insurances including BlueCross, Aetna, Cigna, and UnitedHealthcare. Please note: Health First currently does not accept Medicaid plans. If you're unsure, call our front desk." },
            { q: "Can I book a telehealth visit?", a: "Yes. Telehealth is available for current patients for follow-ups, simple illnesses, and medication refills." },
          ].map((faq, idx) => (
            <FAQItem key={idx} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* PATIENT QUESTIONS & CONCERNS FORM */}
      <PatientConcernForm />

      {/* 11. LOCATION & HOURS */}
      <section id="contact" className="py-24 px-6 bg-[#FAFAF8] border-t border-[#F2EFE9]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-serif font-bold mb-8">Visit Our Clinic</h2>
            
            <div className="bg-white rounded-2xl border border-[#F2EFE9] overflow-hidden mb-8 shadow-sm">
              <div className="p-6 border-b border-[#F2EFE9] flex items-start gap-4">
                <MapPin className="text-[#4A7C59] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-1">Health First Care Clinic</h4>
                  <p className="text-[#6B6B68]">350 West Park Way, Ste 120<br/>Euless, Texas 76040</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold flex items-center gap-2"><Clock className="w-5 h-5" /> Office Hours</h4>
                  <ClinicStatusBadge />
                </div>
                <ul className="space-y-2 text-sm text-[#6B6B68] font-medium">
                  <li className="flex justify-between"><span>Mon - Fri</span> <span className="text-[#1C1C1A]">8:00 AM - 4:00 PM</span></li>
                  <li className="flex justify-between text-[#D4881A]"><span>Sat - Sun</span> <span>Closed</span></li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 text-sm text-[#6B6B68]">
              <p><strong>Parking:</strong> Free patient parking available directly in front of the building (Suite 120).</p>
            </div>
          </div>
          
          <div className="aspect-square lg:aspect-auto lg:h-[600px] bg-[#E8E6DF] rounded-[2rem] flex items-center justify-center text-[#6B6B68] relative overflow-hidden border border-[#F2EFE9]">
            <iframe
              src="https://maps.google.com/maps?q=350%20West%20Park%20Way,%20Ste%20120,%20Euless,%20Texas%2076040&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-[#1C1C1A] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-16 mb-8">
          <div className="flex flex-col items-start gap-6">
            <span className="text-2xl font-serif font-bold tracking-tight">Health First <span className="text-[#4A7C59]">Care</span></span>
            <p className="text-white/60 text-sm leading-relaxed">Primary care that feels like family. Dedicated to the health and wellness of Euless, TX since 2015.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 tracking-widest text-xs uppercase text-white/40">Services</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Annual Physicals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sick Visits</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Telehealth</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vaccinations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 tracking-widest text-xs uppercase text-white/40">Patient Info</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">New Patient Forms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Insurance Accepted</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Patient Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pay Bill Online</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 tracking-widest text-xs uppercase text-white/40">Newsletter</h4>
            <p className="text-sm text-white/80 mb-4">Healthy tips and clinic updates delivered monthly.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:border-[#4A7C59]" />
              <button className="bg-[#4A7C59] px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90">Join</button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} Health First Care Clinic. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">HIPAA Notice</a>
            <a href="#" className="hover:text-white">Accessibility</a>
            <button onClick={() => setCurrentView('staff')} className="hover:text-white underline">Staff Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// Interactive Sub-components
// -------------------------------------------------------------

function FAQItem({ question, answer }: { question: string, answer: string, key?: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border text-left border-[#F2EFE9] rounded-2xl overflow-hidden hover:border-[#4A7C59]/30 transition-colors">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full px-8 py-6 flex items-center justify-between gap-4"
      >
        <span className="font-serif font-bold text-lg text-[#1C1C1A] text-left">{question}</span>
        <ChevronDown className={`w-5 h-5 text-[#4A7C59] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-6 text-[#6B6B68] leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ClinicStatusBadge() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const checkOpenStatus = () => {
      // Very basic logic for Euless, TX (assuming CST roughly matches user local for this demo)
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      
      if (day === 0 || day === 6) {
        setIsOpen(false); // Saturday & Sunday Closed
      } else {
        // Mon-Fri 8-4
        setIsOpen(hour >= 8 && hour < 16);
      }
    };
    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
      {isOpen ? 'OPEN NOW' : 'CLOSED'}
    </div>
  );
}


