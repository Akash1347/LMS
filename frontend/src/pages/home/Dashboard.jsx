import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

const enrolledCourses = [
  { id: 1, title: 'Python Fundamentals',          progress: 72, level: 'beginner',     status: 'active',  lastLesson: 'Functions & Scope' },
  { id: 2, title: 'Data Structures & Algorithms', progress: 45, level: 'intermediate', status: 'active',  lastLesson: 'Binary Trees'      },
  { id: 3, title: 'Machine Learning Basics',      progress: 20, level: 'intermediate', status: 'active',  lastLesson: 'Linear Regression' },
  { id: 4, title: 'Web Development Bootcamp',     progress: 0,  level: 'beginner',     status: 'pending', lastLesson: 'Not started'       },
]

const recentActivity = [
  { emoji: '📝', text: 'Scored 88% on Python Quiz 3',     time: '2h ago' },
  { emoji: '📖', text: 'Completed "Binary Trees" lesson', time: '1d ago' },
  { emoji: '🤖', text: 'AI explained recursion concept',  time: '1d ago' },
  { emoji: '📈', text: 'Moved to #3 on DSA Leaderboard',  time: '2d ago' },
]

const deadlines = [
  { title: 'Python Quiz 4',     due: 'Tomorrow',  urgent: true  },
  { title: 'DSA Module 3 Test', due: 'In 3 days', urgent: false },
  { title: 'ML Assignment 1',   due: 'In 5 days', urgent: false },
]

const leaderboard = [
  { rank: 1, name: 'Priya S.',  score: 97, avatar: 'P' },
  { rank: 2, name: 'Rahul M.', score: 93, avatar: 'R' },
  { rank: 3, name: 'Akash A.', score: 88, avatar: 'A', isMe: true },
  { rank: 4, name: 'Sneha K.', score: 84, avatar: 'S' },
  { rank: 5, name: 'Dev T.',   score: 81, avatar: 'D' },
]

const levelDot  = { beginner: 'bg-emerald-400', intermediate: 'bg-amber-400', advanced: 'bg-rose-400' }
const barColor  = p => p >= 70 ? 'bg-emerald-500' : p >= 40 ? 'bg-indigo-500' : 'bg-amber-400'
const rankLabel = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r

const Dashboard = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-white text-slate-800'>

      {/* ── Nav ─────────────────────────────────────── */}
      <header className='sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-6 py-4'>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-indigo-600' />
            <span className='text-sm font-bold tracking-tight text-slate-900'>LearnAI</span>
          </div>
          <div className='flex items-center gap-5'>
            <button onClick={() => navigate('/courses')}
              className='text-xs font-medium text-slate-500 transition-colors hover:text-slate-900'>
              Browse courses
            </button>
            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white'>
              A
            </div>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-5xl px-6 py-10'>
        <motion.div initial='hidden' animate='show' variants={stagger}>

          {/* Greeting */}
          <motion.div variants={fade} className='mb-10'>
            <h1 className='text-2xl font-extrabold text-slate-900'>Good morning ..</h1>
            <p className='mt-1 text-sm text-slate-400'>1 quiz due tomorrow · 7-day streak 🔥</p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fade} className='mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4'>
            {[['4', 'Enrolled'], ['82%', 'Avg Score'], ['#3', 'Rank'], ['7d', 'Streak']].map(([v, l]) => (
              <div key={l} className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4'>
                <p className='text-2xl font-extrabold text-slate-900'>{v}</p>
                <p className='mt-0.5 text-xs text-slate-400'>{l}</p>
              </div>
            ))}
          </motion.div>

          {/* Body grid */}
          <div className='grid grid-cols-1 gap-10 lg:grid-cols-[1fr_264px]'>

            {/* ── Left ──────────────────────────────── */}
            <div className='space-y-10'>

              {/* Courses */}
              <motion.div variants={fade}>
                <div className='mb-3 flex items-center justify-between'>
                  <p className='text-[11px] font-semibold uppercase tracking-widest text-slate-400'>My Courses</p>
                  <button onClick={() => navigate('/my-courses')}
                    className='text-xs font-medium text-indigo-500 hover:text-indigo-700'>View all</button>
                </div>
                <div className='space-y-2'>
                  {enrolledCourses.map(c => (
                    <div key={c.id}
                      className='flex items-center gap-4 rounded-2xl border border-slate-100 px-4 py-3.5 transition-all hover:border-slate-200 hover:shadow-sm'>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${levelDot[c.level]}`} />
                      <div className='flex-1 min-w-0'>
                        <p className='truncate text-sm font-semibold text-slate-900'>{c.title}</p>
                        <div className='mt-1.5 flex items-center gap-2'>
                          <div className='h-1 flex-1 rounded-full bg-slate-100'>
                            <div className={`h-full rounded-full ${barColor(c.progress)}`} style={{ width: `${c.progress}%` }} />
                          </div>
                          <span className='shrink-0 text-[11px] text-slate-400'>{c.progress}%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => c.status === 'pending' ? navigate(`/payment/${c.id}`) : navigate(`/course-page/${c.id}`)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors
                          ${c.status === 'pending' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
                        {c.status === 'pending' ? 'Pay' : 'Continue'}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Deadlines */}
              <motion.div variants={fade}>
                <p className='mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400'>Due Soon</p>
                <div className='space-y-2'>
                  {deadlines.map(d => (
                    <div key={d.title} className='flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3'>
                      <p className='text-sm font-medium text-slate-800'>{d.title}</p>
                      <span className={`text-xs font-semibold ${d.urgent ? 'text-rose-500' : 'text-slate-400'}`}>{d.due}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right ─────────────────────────────── */}
            <div className='space-y-10'>

              {/* AI tip */}
              <motion.div variants={fade} className='rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4'>
                <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500'>AI Tip</p>
                <p className='text-xs leading-relaxed text-slate-700'>
                  You struggled with <strong>recursion</strong> last quiz. Try
                  "Fibonacci with memoization" before your next test.
                </p>
                <button className='mt-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800'>
                  Practice →
                </button>
              </motion.div>

              {/* Leaderboard */}
              <motion.div variants={fade}>
                <div className='mb-3 flex items-center justify-between'>
                  <p className='text-[11px] font-semibold uppercase tracking-widest text-slate-400'>Leaderboard</p>
                  <button onClick={() => navigate('/leaderboard')} className='text-xs font-medium text-indigo-500 hover:text-indigo-700'>Full</button>
                </div>
                <div className='space-y-1'>
                  {leaderboard.map(row => (
                    <div key={row.rank}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${row.isMe ? 'bg-indigo-50' : ''}`}>
                      <span className='w-4 text-center text-xs text-slate-400'>{rankLabel(row.rank)}</span>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold
                        ${row.isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {row.avatar}
                      </div>
                      <span className={`flex-1 text-xs ${row.isMe ? 'font-bold text-indigo-700' : 'text-slate-600'}`}>
                        {row.name}
                      </span>
                      <span className='text-xs font-bold text-slate-800'>{row.score}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Activity */}
              <motion.div variants={fade}>
                <p className='mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400'>Recent</p>
                <div className='space-y-3'>
                  {recentActivity.map((a, i) => (
                    <div key={i} className='flex items-start gap-2.5'>
                      <span className='mt-0.5 text-sm'>{a.emoji}</span>
                      <div>
                        <p className='text-xs text-slate-700'>{a.text}</p>
                        <p className='text-[10px] text-slate-400'>{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard