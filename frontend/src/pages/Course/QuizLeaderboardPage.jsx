import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetQuizDetailedAnalyticsHook, useGetQuizLeaderboardHook } from '@/hooks/course.hook'
import { motion } from 'framer-motion'

const QuizLeaderboardPage = () => {
  const navigate = useNavigate()
  const { courseId, quizId } = useParams()

  const { data: leaderboardData, isLoading: leaderboardLoading } = useGetQuizLeaderboardHook(quizId, Boolean(quizId))
  const { data: detailedAnalyticsData } = useGetQuizDetailedAnalyticsHook(quizId, Boolean(quizId))

  const rows = useMemo(() => (Array.isArray(leaderboardData) ? leaderboardData : []), [leaderboardData])

  // Animation variants for the list items
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const itemVariants = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }

  return (
    <section className='min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-8'>
      <div className='mx-auto max-w-4xl'>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className='mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent'>
              Quiz Leaderboard
            </h1>
            <p className='mt-1 text-sm font-medium text-slate-400'>ID: {quizId}</p>
          </div>
          <button
            type='button' onClick={() => navigate(`/course-page/${courseId}/quiz/${quizId}`)}
            className='inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-indigo-600 hover:shadow-md'
          >
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            Back to Quiz
          </button>
        </motion.div>

        {/* Soft-styled Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {[
            { label: 'Total Attempts', value: Number(detailedAnalyticsData?.stats?.total_attempts || 0)},
            { label: 'Average Score', value: Number(detailedAnalyticsData?.stats?.average_score  || 0).toFixed(1) },
            { label: 'Highest Score', value: Number(detailedAnalyticsData?.stats?.highest_score  || 0)  },
          ].map(s => (
            <div key={s.label} className='flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100'>
              <span className='mb-2 text-2xl'>{s.icon}</span>
              <p className='text-3xl font-bold text-slate-800'>{s.value}</p>
              <p className='mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400'>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Attractive Leaderboard List */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className='overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100'>
          
          <div className='bg-slate-50/50 px-6 py-4 border-b border-slate-100'>
            <h2 className='text-sm font-semibold text-slate-700'>Top Performers</h2>
          </div>

          {leaderboardLoading ? (
            <div className='flex items-center justify-center p-12'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-500' />
            </div>
          ) : rows.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-16 text-center'>
              <p className='mb-2 text-4xl'>🌱</p>
              <p className='text-lg font-medium text-slate-700'>No scores yet</p>
              <p className='text-sm text-slate-400'>The leaderboard is waiting for its first champion.</p>
            </div>
          ) : (
            <motion.ul variants={containerVariants} initial="hidden" animate="show" className='divide-y divide-slate-50'>
              {rows.map((row, index) => {
                // Special styling for Top 3
                const isTop3 = index < 3;
                const rankStyles = [
                  'bg-amber-100 text-amber-700 ring-amber-200', // 1st - Gold
                  'bg-slate-100 text-slate-600 ring-slate-200', // 2nd - Silver
                  'bg-orange-100 text-orange-700 ring-orange-200' // 3rd - Bronze
                ];
                
                return (
                  <motion.li variants={itemVariants} key={row.id || `${row.student_id}-${index}`}
                    className='group flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50'
                  >
                    <div className='flex items-center gap-4'>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ring-1 
                        ${isTop3 ? rankStyles[index] : 'bg-slate-50 text-slate-400 ring-slate-100'}`}
                      >
                        {index + 1}
                      </span>
                      <span className='font-medium text-slate-700 group-hover:text-indigo-600 transition-colors'>
                        {row.student_id}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg font-bold text-slate-800'>{row.score}</span>
                      <span className='text-xs font-medium text-slate-400'>pts</span>
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>
          )}
        </motion.div>

      </div>
    </section>
  )
}

export default QuizLeaderboardPage