import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ─── Google Fonts ──────────────────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    .font-display { font-family: 'Playfair Display', serif; }
  `}</style>
);

/* ─── Icons ─────────────────────────────────────────────── */
const Icon = ({ d, size = 24, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none'
    stroke='currentColor' strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'
    className={className} style={style}>
    <path d={d} />
  </svg>
);

/* ─── Data ──────────────────────────────────────────────── */
const features = [
  {
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    title: 'Expert-Led Courses',
    desc: 'Learn from top creators across thousands of subjects, from business to design.',
    accent: '#6366f1', bg: '#eef2ff', border: '#c7d2fe',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    title: 'Adaptive AI Quizzes',
    desc: 'Tests that dynamically adjust to your skill level to ensure true understanding.',
    accent: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Your AI Co-Pilot',
    desc: 'Stuck on a concept? Your personal AI tutor breaks it down instantly.',
    accent: '#d97706', bg: '#fffbeb', border: '#fde68a',
  },
  {
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Creator Economy',
    desc: 'Build, publish, and monetize your own courses with AI-assisted creator tools.',
    accent: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
  },
  {
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    title: 'Smart Learning Paths',
    desc: 'AI-driven study plans personalized to your schedule and career goals.',
    accent: '#db2777', bg: '#fdf2f8', border: '#fbcfe8',
  },
  {
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    title: 'Global Community',
    desc: 'Join study pods, ask questions, and collaborate with learners worldwide.',
    accent: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
  },
];

const stats = [
  { value: '2,500+', label: 'Courses Available' },
  { value: '100K+', label: 'Active Learners' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '$2M+', label: 'Creator Earnings' },
];

const steps = [
  { n: '01', title: 'Discover', desc: 'Browse thousands of courses or sign up to teach your own.' },
  { n: '02', title: 'Engage', desc: 'Dive into interactive modules, videos, and practical projects.' },
  { n: '03', title: 'Master', desc: 'Solidify your knowledge with AI-adaptive tests and feedback.' },
  { n: '04', title: 'Achieve', desc: 'Earn verified certificates and unlock your next career move.' },
];

const instructors = [
  { name: 'Priya Nair', subject: 'Full-Stack Dev', students: '9.2K', rating: '4.9', initial: 'P', color: '#6366f1' },
  { name: 'James Okafor', subject: 'Data Science', students: '7.8K', rating: '4.8', initial: 'J', color: '#0891b2' },
  { name: 'Sofia Reyes', subject: 'UI/UX Design', students: '6.3K', rating: '4.9', initial: 'S', color: '#db2777' },
  { name: 'Arjun Mehta', subject: 'Cloud & DevOps', students: '5.1K', rating: '4.7', initial: 'A', color: '#059669' },
];

/* ─── Animations ────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } }
};
const stagger = { show: { transition: { staggerChildren: 0.13 } } };
const floating = {
  y: ['-8px', '8px'],
  transition: { duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
};

export default function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <>
      <FontLoader />
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}
        className='min-h-screen bg-[#FAFAF7] text-slate-800 relative overflow-x-hidden selection:bg-indigo-200'>

        {/* Warm background blobs */}
        <div className="fixed top-[-5%] left-[-8%] w-[35%] h-[35%] rounded-full bg-indigo-100 blur-[100px] opacity-70 pointer-events-none" />
        <div className="fixed bottom-[10%] right-[-8%] w-[30%] h-[30%] rounded-full bg-amber-100 blur-[100px] opacity-80 pointer-events-none" />
        <div className="fixed top-[40%] left-[30%] w-[20%] h-[20%] rounded-full bg-pink-100 blur-[80px] opacity-60 pointer-events-none" />

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className='relative flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-36 text-center z-10'>
          <motion.div initial='hidden' animate='show' variants={stagger} className='mx-auto max-w-4xl'>

            <motion.div variants={fadeUp}
              className='mb-8 inline-flex items-center gap-2.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60'></span>
                <span className='relative inline-flex h-2 w-2 rounded-full bg-indigo-500'></span>
              </span>
              The Future of Learning & Teaching
            </motion.div>

            <motion.h1 variants={fadeUp}
              style={{ fontFamily: "'Playfair Display', serif" }}
              className='mb-6 text-5xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-7xl lg:text-[5.5rem]'>
              Master Any Skill.{' '}
              <br className="hidden sm:block" />
              <span className='relative inline-block'>
                <span className='relative z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent'>
                  Supercharged by AI.
                </span>
                <svg className='absolute -bottom-3 left-0 w-full' viewBox='0 0 300 12' fill='none' preserveAspectRatio='none'>
                  <path d='M2 8 Q75 2 150 8 Q225 14 298 8' stroke='#6366f1' strokeWidth='3' strokeLinecap='round' fill='none' opacity='0.35'/>
                </svg>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp}
              className='mx-auto mb-10 max-w-2xl text-lg text-slate-500 leading-relaxed sm:text-xl'>
              Whether you're learning photography, mastering Python, or building a business — our AI-driven marketplace adapts to your pace and guides you to success.
            </motion.p>

            <motion.div variants={fadeUp} className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className='group w-full overflow-hidden rounded-full bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all sm:w-auto'>
                Start Learning Free
                <span className='ml-2 inline-block transition-transform group-hover:translate-x-1'>→</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/teach')}
                className='w-full rounded-full border-2 border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-all sm:w-auto'>
                Become an Instructor
              </motion.button>
            </motion.div>

            <motion.p variants={fadeUp} className='mt-6 text-xs text-slate-400'>
              Join <span className='font-semibold text-slate-600'>100,000+ learners</span> and <span className='font-semibold text-slate-600'>500+ instructors</span> — no credit card required.
            </motion.p>
          </motion.div>

          {/* Floating mockup */}
          <motion.div
            initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1.2, ease }}
            className='relative mx-auto mt-20 w-full max-w-4xl'>
            <motion.div animate={floating}
              className='overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.10)] ring-1 ring-slate-100'>
              <div className='rounded-xl bg-slate-50 border border-slate-100 p-6'>
                <div className='mb-6 flex items-center justify-between border-b border-slate-100 pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm text-white text-xs font-bold'>LM</div>
                    <div>
                      <div className='text-xs font-semibold text-slate-700'>LearnMarket</div>
                      <div className='text-xs text-slate-400 mt-0.5'>Explore 2,500+ courses</div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-28 rounded-full bg-slate-100 border border-slate-200 flex items-center px-3 gap-2'>
                      <div className='h-2 w-2 rounded-full bg-slate-300' />
                      <div className='h-2 w-14 rounded bg-slate-200' />
                    </div>
                    <div className='h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center'>
                      <div className='h-3 w-3 rounded-full bg-indigo-400' />
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                  {[
                    { color: '#eef2ff', tag: 'Development', accent: '#6366f1' },
                    { color: '#ecfeff', tag: 'Data Science', accent: '#0891b2' },
                    { color: '#fffbeb', tag: 'Design', accent: '#d97706' },
                    { color: '#ecfdf5', tag: 'Business', accent: '#059669' },
                  ].map((c, i) => (
                    <div key={i} style={{ backgroundColor: c.color }} className='rounded-xl p-4 border border-white shadow-sm'>
                      <div className='mb-3 h-20 w-full rounded-lg bg-white/70 border border-white/80' />
                      <div className='h-2.5 w-3/4 rounded bg-slate-200 mb-2' />
                      <div className='h-2 w-1/2 rounded bg-slate-100 mb-3' />
                      <div className='flex items-center justify-between'>
                        <span style={{ color: c.accent }} className='text-xs font-bold'>{c.tag}</span>
                        <div style={{ backgroundColor: c.accent + '20', color: c.accent }}
                          className='h-6 w-14 rounded-full text-xs flex items-center justify-center font-semibold'>
                          Enroll
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            {/* Floating notification badges */}
            <motion.div animate={{ y: [0, -6, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } }}
              className='absolute -left-4 top-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg hidden md:block'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-sm font-black'>✓</div>
                <div>
                  <p className='text-xs font-bold text-slate-800'>New Enrollment</p>
                  <p className='text-xs text-slate-400'>Python Masterclass</p>
                </div>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 } }}
              className='absolute -right-4 bottom-10 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg hidden md:block'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>⭐</span>
                <div>
                  <p className='text-xs font-bold text-slate-800'>4.9 Rating</p>
                  <p className='text-xs text-slate-400'>1,240 reviews</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <section className='border-y border-slate-200 bg-white px-6 py-16'>
          <motion.div initial='hidden' whileInView='show' viewport={{ once: true, margin: '-50px' }} variants={stagger}
            className='mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-4'>
            {stats.map(s => (
              <motion.div key={s.label} variants={fadeUp} className='text-center'>
                <p style={{ fontFamily: "'Playfair Display', serif" }}
                  className='text-4xl font-black tracking-tight text-slate-900 sm:text-5xl'>{s.value}</p>
                <p className='mt-2 text-xs font-bold uppercase tracking-widest text-indigo-500 sm:text-sm'>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Features ─────────────────────────────────────────────── */}
        <section id='features' className='px-6 py-28'>
          <div className='mx-auto max-w-6xl'>
            <motion.div initial='hidden' whileInView='show' viewport={{ once: true, margin: '-100px' }} variants={stagger} className='mb-16 max-w-xl'>
              <motion.p variants={fadeUp} className='mb-3 text-xs font-bold uppercase tracking-widest text-indigo-500'>Platform Features</motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif" }}
                className='text-4xl font-black tracking-tight text-slate-900 sm:text-5xl leading-tight'>
                Designed for <span className='text-indigo-600'>curiosity.</span>
              </motion.h2>
            </motion.div>

            <motion.div initial='hidden' whileInView='show' viewport={{ once: true, margin: '-80px' }} variants={stagger}
              className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {features.map((f) => (
                <motion.div key={f.title} variants={fadeUp}
                  whileHover={{ y: -6 }}
                  style={{ borderColor: f.border }}
                  className='group relative overflow-hidden rounded-2xl border bg-white p-7 transition-all duration-300 cursor-default shadow-sm hover:shadow-md'>
                  <div style={{ backgroundColor: f.bg }} className='absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-60 group-hover:opacity-100 transition-opacity' />
                  <div style={{ backgroundColor: f.bg, border: `1.5px solid ${f.border}` }}
                    className='relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl'>
                    <Icon d={f.icon} size={22} style={{ color: f.accent }} />
                  </div>
                  <h3 className='mb-2 text-base font-bold text-slate-900'>{f.title}</h3>
                  <p className='text-sm text-slate-500 leading-relaxed'>{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Featured Instructors ─────────────────────────────────── */}
        <section className='bg-slate-50 border-y border-slate-200 px-6 py-24'>
          <div className='mx-auto max-w-6xl'>
            <motion.div initial='hidden' whileInView='show' viewport={{ once: true }} variants={stagger}
              className='mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <motion.p variants={fadeUp} className='mb-2 text-xs font-bold uppercase tracking-widest text-indigo-500'>Top Educators</motion.p>
                <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif" }}
                  className='text-4xl font-black text-slate-900'>
                  Learn from the <span className='text-indigo-600'>best.</span>
                </motion.h2>
              </div>
              <motion.button variants={fadeUp} className='text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-auto underline underline-offset-4'>
                View all instructors →
              </motion.button>
            </motion.div>

            <motion.div initial='hidden' whileInView='show' viewport={{ once: true }} variants={stagger}
              className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
              {instructors.map((ins) => (
                <motion.div key={ins.name} variants={fadeUp} whileHover={{ y: -5 }}
                  className='rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer'>
                  <div style={{ backgroundColor: ins.color + '18', color: ins.color }}
                    className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-black'>
                    {ins.initial}
                  </div>
                  <h4 className='font-bold text-slate-900 text-sm'>{ins.name}</h4>
                  <p className='text-xs text-slate-500 mt-1'>{ins.subject}</p>
                  <div className='mt-4 flex justify-center gap-4 text-xs'>
                    <span style={{ color: ins.color }} className='font-semibold'>{ins.students} students</span>
                    <span className='text-amber-500 font-semibold'>★ {ins.rating}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────── */}
        <section id='how-it-works' className='px-6 py-28'>
          <div className='mx-auto max-w-6xl'>
            <motion.div initial='hidden' whileInView='show' viewport={{ once: true }} variants={stagger} className='mb-16 max-w-xl'>
              <motion.p variants={fadeUp} className='mb-3 text-xs font-bold uppercase tracking-widest text-indigo-500'>The Process</motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif" }}
                className='text-4xl font-black tracking-tight text-slate-900 sm:text-5xl leading-tight'>
                From beginner to <span className='text-indigo-600'>pro</span> in 4 steps.
              </motion.h2>
            </motion.div>

            <motion.div initial='hidden' whileInView='show' viewport={{ once: true }} variants={stagger}
              className='grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4'>
              {steps.map((s, idx) => (
                <motion.div key={s.n} variants={fadeUp} className='group relative'>
                  {idx < steps.length - 1 && (
                    <div className='absolute top-6 hidden lg:block border-t-2 border-dashed border-slate-200 z-0'
                      style={{ left: '3rem', width: 'calc(100% - 1rem)' }} />
                  )}
                  <div className='relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform'>
                    {s.n}
                  </div>
                  <h4 className='mb-2 text-lg font-bold text-slate-900'>{s.title}</h4>
                  <p className='text-sm text-slate-500 leading-relaxed'>{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Dual CTA ─────────────────────────────────────────────── */}
        <section className='bg-slate-50 border-y border-slate-200 px-6 py-20'>
          <div className='mx-auto max-w-6xl grid grid-cols-1 gap-6 md:grid-cols-2'>

            {/* Student card */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}
              className='relative overflow-hidden rounded-3xl bg-indigo-600 px-8 py-12 text-left shadow-xl shadow-indigo-200'>
              <div className='absolute top-0 right-0 h-48 w-48 translate-x-10 -translate-y-10 rounded-full bg-indigo-500 opacity-40' />
              <div className='absolute bottom-0 right-12 h-32 w-32 translate-y-8 rounded-full bg-violet-500 opacity-30' />
              <div className='relative z-10'>
                <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 border border-white/30'>
                  <Icon d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' size={22} className='text-white' />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif" }} className='text-2xl font-black text-white mb-3'>Ready to start learning?</h3>
                <p className='text-indigo-200 mb-8 leading-relaxed text-sm'>Explore expert-led courses and start building skills that get you hired.</p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/courses')}
                  className='rounded-full bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors'>
                  Explore Courses →
                </motion.button>
              </div>
            </motion.div>

            {/* Instructor card */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}
              className='relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white px-8 py-12 text-left shadow-sm hover:shadow-md transition-shadow'>
              <div className='absolute top-0 right-0 h-48 w-48 translate-x-10 -translate-y-10 rounded-full bg-amber-50' />
              <div className='relative z-10'>
                <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200'>
                  <Icon d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' size={22} className='text-amber-600' />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif" }} className='text-2xl font-black text-slate-900 mb-3'>Have knowledge to share?</h3>
                <p className='text-slate-500 mb-8 leading-relaxed text-sm'>Publish your course, reach thousands of students, and earn on your own schedule.</p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/teach')}
                  className='rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-700 transition-colors'>
                  Become an Instructor →
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Newsletter CTA ─────────────────────────────────────────── */}
        <section className='px-6 py-20'>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}
            className='mx-auto max-w-2xl text-center'>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className='text-3xl font-black text-slate-900 mb-4 sm:text-4xl'>Ready to level up?</h2>
            <p className='text-slate-500 mb-8 text-base'>Join thousands of students and creators building the future of learning.</p>
            <div className='flex flex-col items-center gap-3 sm:flex-row'>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder='Enter your email address'
                className='w-full rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all' />
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className='w-full shrink-0 rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors sm:w-auto'>
                Create Account
              </motion.button>
            </div>
          </motion.div>
        </section>

      </div>
    </>
  );
}