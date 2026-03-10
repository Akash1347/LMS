import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

/* ─── Icons ─────────────────────────────────────────────── */
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none'
    stroke='currentColor' strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'>
    <path d={d} />
  </svg>
)

const features = [
  {
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    title: 'Structured Courses',
    desc: 'Browse instructor-led courses organized into focused, manageable modules.',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    title: 'Adaptive Quizzes',
    desc: 'Tests that adjust to your skill level—building confidence while pushing limits.',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'AI Feedback',
    desc: 'Instant, natural-language explanations for every mistake you make.',
  },
  {
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    title: 'Live Leaderboards',
    desc: 'See how you rank among peers. Friendly competition to keep motivation high.',
  },
  {
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    title: 'Smart Notifications',
    desc: 'Deadline reminders, retest alerts, and AI-driven study nudges.',
  },
  {
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    title: 'Discussion Forums',
    desc: 'Post questions and collaborate with peers in module-level threads.',
  },
]

const stats = [
  { value: '50+', label: 'Courses' },
  { value: '1K+', label: 'Active Learners' },
  { value: '98%', label: 'Satisfaction' },
  { value: '24/7', label: 'AI Support' },
]

const steps = [
  { n: '01', title: 'Create Account', desc: 'Sign up in under a minute.' },
  { n: '02', title: 'Enroll', desc: 'Pick a topic and start instantly.' },
  { n: '03', title: 'Test', desc: 'Prove understanding with adaptive quizzes.' },
  { n: '04', title: 'Grow', desc: 'Watch your knowledge map expand.' },
]

/* ─── Animations ────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] // Custom smooth easing
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } }
}
const stagger = {
  show: { transition: { staggerChildren: 0.1 } }
}

const HomePage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  return (
    <div className='min-h-screen bg-[#FAFAFA] text-zinc-900 selection:bg-zinc-200'>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className='relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 text-center'>
        <motion.div initial='hidden' animate='show' variants={stagger} className='relative z-10 mx-auto max-w-3xl'>
          <motion.div variants={fadeUp}
            className='mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500 shadow-sm'>
            <span className='h-1.5 w-1.5 rounded-full bg-zinc-900 animate-pulse' />
            AI-Powered Adaptive Learning
          </motion.div>

          <motion.h1 variants={fadeUp}
            className='mb-6 text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl'>
            Learn smarter.<br />
            <span className='text-zinc-400'>Not just harder.</span>
          </motion.h1>

          <motion.p variants={fadeUp}
            className='mx-auto mb-10 max-w-xl text-lg text-zinc-500'>
            An intelligent platform that adapts tests to your level, explains your mistakes in plain English, and guides you to mastery.
          </motion.p>

          <motion.div variants={fadeUp} className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className='w-full rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-zinc-900/20 transition-colors hover:bg-zinc-800 sm:w-auto'>
              Start learning free
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/courses')}
              className='w-full rounded-full border border-zinc-200 bg-white px-8 py-3.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 sm:w-auto'>
              Browse courses
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Minimal Mock Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1, ease }}
          className='relative mx-auto mt-20 w-full max-w-3xl'>
          <div className='overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/50 p-2 shadow-2xl shadow-zinc-200/50 backdrop-blur-xl'>
            <div className='rounded-xl border border-zinc-100 bg-white p-6'>
              <div className='mb-6 flex items-center justify-between border-b border-zinc-100 pb-4'>
                <div className='flex items-center gap-3'>
                  <div className='h-8 w-8 rounded-full bg-zinc-100' />
                  <div>
                    <div className='h-3 w-20 rounded bg-zinc-200' />
                    <div className='mt-1.5 h-2 w-12 rounded bg-zinc-100' />
                  </div>
                </div>
                <div className='h-6 w-24 rounded-full bg-zinc-100' />
              </div>
              <div className='grid grid-cols-3 gap-4'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='rounded-lg border border-zinc-100 p-4'>
                    <div className='mb-2 h-4 w-8 rounded bg-zinc-200' />
                    <div className='h-2 w-16 rounded bg-zinc-100' />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className='border-y border-zinc-200/50 bg-white px-6 py-16'>
        <motion.div initial='hidden' whileInView='show' viewport={{ once: true, margin: '-100px' }} variants={stagger}
          className='mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4'>
          {stats.map(s => (
            <motion.div key={s.label} variants={fadeUp} className='text-center'>
              <p className='text-4xl font-light tracking-tight text-zinc-900'>{s.value}</p>
              <p className='mt-2 text-xs font-medium uppercase tracking-widest text-zinc-400'>{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section id='features' className='px-6 py-24'>
        <div className='mx-auto max-w-5xl'>
          <motion.div initial='hidden' whileInView='show' viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className='mb-16'>
            <motion.h2 variants={fadeUp} className='text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl'>
              Everything you need. <span className='text-zinc-400'>Nothing you don't.</span>
            </motion.h2>
          </motion.div>

          <motion.div initial='hidden' whileInView='show' viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className='grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'>
            {features.map(f => (
              <motion.div key={f.title} variants={fadeUp} className='group relative'>
                <div className='mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-colors group-hover:bg-zinc-900 group-hover:text-white'>
                  <Icon d={f.icon} size={18} />
                </div>
                <h3 className='mb-2 text-base font-semibold text-zinc-900'>{f.title}</h3>
                <p className='text-sm leading-relaxed text-zinc-500'>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id='how-it-works' className='bg-zinc-50 px-6 py-24'>
        <div className='mx-auto max-w-5xl'>
          <motion.div initial='hidden' whileInView='show' viewport={{ once: true }} variants={stagger}
            className='mb-16'>
            <motion.h2 variants={fadeUp} className='text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl'>
              From zero to certified.
            </motion.h2>
          </motion.div>

          <motion.div initial='hidden' whileInView='show' viewport={{ once: true }} variants={stagger}
            className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
            {steps.map((s) => (
              <motion.div key={s.n} variants={fadeUp} className='border-l border-zinc-200 pl-6'>
                <p className='mb-4 font-mono text-sm font-medium text-zinc-400'>{s.n}</p>
                <h4 className='mb-2 text-base font-semibold text-zinc-900'>{s.title}</h4>
                <p className='text-sm leading-relaxed text-zinc-500'>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className='px-6 py-24'>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}
          className='mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-zinc-950 px-8 py-20 text-center shadow-2xl'>
          <h2 className='mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl'>Ready to begin?</h2>
          <p className='mx-auto mb-10 max-w-xl text-lg text-zinc-400'>Join thousands of learners already growing with AI-powered guidance. Start your journey today.</p>
          <div className='mx-auto flex max-w-md flex-col items-center gap-3 sm:flex-row'>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder='Enter your email'
              className='w-full rounded-full bg-white/10 px-6 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-white/20' />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className='w-full shrink-0 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 sm:w-auto'>
              Sign up free
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className='border-t border-zinc-200/50 bg-[#FAFAFA] px-6 py-12'>
        <div className='mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-sm text-zinc-500 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded bg-zinc-900'>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5'>
                <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
              </svg>
            </div>
            <span className='font-semibold text-zinc-900'>LearnAI</span>
          </div>
          <p>© {new Date().getFullYear()} LearnAI. All rights reserved.</p>
          <div className='flex gap-6'>
            {['Privacy', 'Terms', 'Support'].map(l => (
              <a key={l} href='#' className='transition-colors hover:text-zinc-900'>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage