import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetQuizDetailedAnalyticsHook, useGetQuizLeaderboardHook } from '@/hooks/course.hook'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
}

const QuizLeaderboardPage = () => {
  const navigate = useNavigate()
  const { courseId, quizId } = useParams()

  const { data: leaderboardData, isLoading: leaderboardLoading } = useGetQuizLeaderboardHook(quizId, Boolean(quizId))
  const { data: detailedAnalyticsData } = useGetQuizDetailedAnalyticsHook(quizId, Boolean(quizId))

  const rows = useMemo(() => (Array.isArray(leaderboardData) ? leaderboardData : []), [leaderboardData])

  const podiumOrder = rows.length >= 3 ? [rows[1], rows[0], rows[2]] : []
  const podiumConfig = [
    { label: '🥈', height: 'h-20', bg: 'bg-slate-100',  ring: 'ring-slate-300',  text: 'text-slate-600', rank: '2nd' },
    { label: '🥇', height: 'h-28', bg: 'bg-amber-50',   ring: 'ring-amber-300',  text: 'text-amber-600', rank: '1st' },
    { label: '🥉', height: 'h-16', bg: 'bg-orange-50',  ring: 'ring-orange-300', text: 'text-orange-600', rank: '3rd' },
  ]

  return (
    <section className='min-h-screen bg-slate-50 px-4 py-12 sm:px-8'>
      <div className='mx-auto max-w-2xl'>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className='mb-10 flex items-start justify-between gap-4'>
          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500'>Rankings</p>
            <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl'>Leaderboard</h1>
            <p className='mt-2 text-sm text-slate-500'>Quiz ID: {quizId}</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            type='button' onClick={() => navigate(`/course-page/${courseId}/quiz/${quizId}`)}
            className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50'>
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}><polyline points='15 18 9 12 15 6' /></svg>
            Back to Quiz
          </motion.button>
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className='mb-8 grid grid-cols-3 gap-4'>
          {[
            { label: 'Attempts',      value: Number(detailedAnalyticsData?.stats?.total_attempts || 0),               color: 'text-indigo-600' },
            { label: 'Avg Score',     value: Number(detailedAnalyticsData?.stats?.average_score  || 0).toFixed(1),    color: 'text-emerald-600' },
            { label: 'Highest Score', value: Number(detailedAnalyticsData?.stats?.highest_score  || 0),               color: 'text-amber-600'  },
          ].map(s => (
            <div key={s.label} className='rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm'>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className='mt-1 text-xs text-slate-500'>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Podium */}
        {rows.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className='mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-400'>Top 3</p>
            <div className='flex items-end justify-center gap-4'>
              {podiumOrder.map((row, i) => {
                const cfg = podiumConfig[i]
                return (
                  <motion.div key={`podium-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className='flex flex-1 flex-col items-center gap-2'>
                    <span className='text-2xl'>{cfg.label}</span>
                    <p className='text-center text-xs font-semibold text-slate-700 max-w-[80px] truncate'>{row.student_id}</p>
                    <p className={`text-lg font-extrabold ${cfg.text}`}>{row.score}</p>
                    <div className={`w-full rounded-t-xl ${cfg.bg} ring-2 ${cfg.ring} flex ${cfg.height} items-center justify-center`}>
                      <span className='text-sm font-bold text-slate-500'>{cfg.rank}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Full list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='h-1 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-transparent' />

          {leaderboardLoading ? (
            <div className='flex items-center justify-center p-16'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500' />
            </div>
          ) : rows.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-16 text-center'>
              <p className='text-4xl mb-3'>🏆</p>
              <p className='font-semibold text-slate-700'>No entries yet</p>
              <p className='text-sm text-slate-400'>Be the first to complete this quiz!</p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-[48px_1fr_80px] border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400'>
                <span>Rank</span><span>Student</span><span className='text-right'>Score</span>
              </div>
              <motion.div variants={containerVariants} initial='hidden' animate='show'>
                {rows.map((row, index) => (
                  <motion.div key={row.id || `${row.student_id}-${index}`} variants={rowVariants}
                    className={`grid grid-cols-[48px_1fr_80px] items-center border-b border-slate-50 px-5 py-3.5 transition-colors last:border-0 hover:bg-slate-50 ${index < 3 ? 'bg-amber-50/40' : ''}`}>
                    <span className='text-sm font-bold text-slate-500'>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className='truncate text-sm font-medium text-slate-700'>{row.student_id}</span>
                    <span className={`text-right text-sm font-extrabold ${index < 3 ? 'text-amber-600' : 'text-indigo-600'}`}>{row.score}</span>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default QuizLeaderboardPage