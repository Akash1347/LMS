import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetQuizLeaderboardHook, useStartQuizHook, useSubmitQuizAttemptHook } from '@/hooks/course.hook'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const parseOptions = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try { const p = JSON.parse(value); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  return []
}

const formatTime = (seconds) => {
  const s = Math.max(0, Number(seconds || 0))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const getCurrentUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return null
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded?.sub || null
  } catch { return null }
}

const QuizPage = () => {
  const navigate = useNavigate()
  const { courseId, quizId } = useParams()

  const { mutate: startQuiz, isPending: startingQuiz }             = useStartQuizHook()
  const { mutate: submitQuizAttempt, isPending: submittingQuiz }   = useSubmitQuizAttemptHook()

  const [attempt, setAttempt]               = useState(null)
  const [quizMeta, setQuizMeta]             = useState(null)
  const [questions, setQuestions]           = useState([])
  const [answers, setAnswers]               = useState({})
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [result, setResult]                 = useState(null)
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false)
  const [userId]                            = useState(() => getCurrentUserIdFromToken())
  const [activeQuestion, setActiveQuestion] = useState(0)

  const { data: leaderboardData, isLoading: leaderboardLoading } = useGetQuizLeaderboardHook(quizId, Boolean(quizId))
  const leaderboardRows = useMemo(() => (Array.isArray(leaderboardData) ? leaderboardData : []), [leaderboardData])
  const hasCompletedFromLeaderboard = useMemo(() => Boolean(userId && leaderboardRows.some(r => String(r?.student_id) === String(userId))), [leaderboardRows, userId])
  const attemptedCount = useMemo(() => Object.keys(answers).filter(k => Boolean(answers[k])).length, [answers])
  const totalQuestions = questions.length
  const isCompleted = Boolean(result)
  const showCompletedState = isAlreadyCompleted || hasCompletedFromLeaderboard || isCompleted
  const progressPercent = totalQuestions > 0 ? (attemptedCount / totalQuestions) * 100 : 0
  const timeWarning = remainingSeconds > 0 && remainingSeconds <= 60

  useEffect(() => {
    if (!attempt?.started_at || !attempt?.quiz_id) return
    const limitSeconds = (Number(quizMeta?.time_limit || 0)) * 60
    if (!limitSeconds) { setRemainingSeconds(0); return }
    const startedAtMs = new Date(attempt.started_at).getTime()
    const tick = () => setRemainingSeconds(Math.max(0, limitSeconds - Math.floor((Date.now() - startedAtMs) / 1000)))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [attempt, quizMeta])

  const handleStartQuiz = () => {
    startQuiz({ courseId, quizId }, {
      onSuccess: (res) => {
        setAttempt(res?.data?.attempt || null)
        setQuestions(Array.isArray(res?.data?.questions) ? res.data.questions : [])
        setQuizMeta(res?.data?.quiz || null)
        setAnswers({}); setResult(null); setIsAlreadyCompleted(false); setActiveQuestion(0)
      },
      onError: (err) => {
        if (err?.response?.status === 409) { setIsAlreadyCompleted(true); toast.info('Quiz already completed.') }
      },
    })
  }

  const handleSelectAnswer = (questionId, optionId) => {
    if (isCompleted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmitQuiz = () => {
    if (!attempt?.id) return
    submitQuizAttempt({ attemptId: attempt.id, answer: answers }, {
      onSuccess: (res) => {
        setResult(res?.data || null)
        setAttempt(null); setQuestions([]); setAnswers({}); setIsAlreadyCompleted(true)
        toast.success('Quiz submitted successfully!')
      },
    })
  }

  return (
    <section className='min-h-screen bg-[#eceff4] px-4 py-8 sm:px-8'>
      <div className='mx-auto max-w-7xl'>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type='button' onClick={() => navigate(`/course-page/${courseId}`)}
            className='inline-flex items-center gap-2 text-slate-900'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}><polyline points='15 18 9 12 15 6' /></svg>
            <span className='text-2xl font-semibold tracking-tight'>Back to Tests</span>
          </motion.button>

          <button
            type='button'
            className='inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700'
          >
            ⓘ Report Issue
          </button>
        </motion.div>

        {/* Pre-quiz / completed state */}
        {!attempt ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
            {leaderboardLoading ? (
              <div className='flex min-h-[320px] items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600' />
              </div>
            ) : showCompletedState ? (
              <div className='flex min-h-[320px] flex-col items-center justify-center p-10 text-center'>
                <div className='mb-4 text-5xl'></div>
                <h3 className='text-2xl font-extrabold text-emerald-600'>Quiz Completed!</h3>
                <p className='mt-2 text-slate-500'>You have already completed this quiz.</p>
                {result && (
                  <p className='mt-3 text-2xl font-extrabold text-slate-900'>
                    Score: <span className='text-indigo-600'>{result?.totalScore ?? 0}</span>
                  </p>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type='button' onClick={() => navigate(`/course-page/${courseId}/quiz/${quizId}/leaderboard`)}
                  className='mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700'>
                  View Leaderboard
                </motion.button>
              </div>
            ) : (
              <div className='grid min-h-[390px] grid-cols-1 md:grid-cols-[1.45fr_1fr]'>
                <div className='p-8 md:p-10'>
                  <h3 className='text-4xl font-bold leading-tight text-slate-900 md:text-5xl'>
                    {quizMeta?.title || 'Quiz'}
                  </h3>

                  <div className='mt-8 grid gap-6 sm:grid-cols-3'>
                    <div className='flex items-start gap-3'>
                      <span className='rounded-full bg-blue-100 p-2 text-blue-600'>🕒</span>
                      <div>
                        <p className='text-sm text-slate-500'>Duration</p>
                        <p className='text-2xl font-semibold text-slate-900'>
                          {quizMeta?.time_limit ? `${quizMeta.time_limit} minutes` : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <span className='rounded-full bg-emerald-100 p-2 text-emerald-600'>✓</span>
                      <div>
                        <p className='text-sm text-slate-500'>Total Marks</p>
                        <p className='text-2xl font-semibold text-slate-900'>
                          {quizMeta?.total_marks ?? 0} marks
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <span className='rounded-full bg-violet-100 p-2 text-violet-600'>▤</span>
                      <div>
                        <p className='text-sm text-slate-500'>Questions</p>
                        <p className='text-2xl font-semibold text-slate-900'>
                          {(quizMeta?.question_count ?? totalQuestions ?? 0)} total
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type='button' onClick={handleStartQuiz} disabled={startingQuiz}
                    className='mt-10 rounded-lg bg-emerald-600 px-10 py-3 text-xl font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60'>
                    {startingQuiz ? 'Starting...' : 'Take Test'}
                  </motion.button>

                  <p className='mt-4 text-2xl text-slate-600'>
                    {(quizMeta?.attempts_remaining ?? quizMeta?.remaining_attempts) != null
                      ? `${quizMeta?.attempts_remaining ?? quizMeta?.remaining_attempts} attempt${Number(quizMeta?.attempts_remaining ?? quizMeta?.remaining_attempts) === 1 ? '' : 's'} remaining`
                      : 'Attempts info unavailable'}
                  </p>
                </div>

                <div className='relative hidden overflow-hidden bg-[#e8eef8] md:block'>
                  <div className='absolute left-16 top-12 h-20 w-20 rounded-full bg-[#ffd8a6]' />
                  <div className='absolute left-14 top-36 h-20 w-40 rotate-[-20deg] rounded-xl border-4 border-slate-400 bg-white/80' />
                  <div className='absolute right-20 top-14 h-56 w-44 rotate-[-18deg] rounded-xl bg-white shadow-sm' />
                  <div className='absolute right-8 top-44 h-48 w-40 rotate-[20deg] rounded-xl bg-slate-300/70' />
                  <div className='absolute bottom-5 left-32 h-40 w-36 rotate-[50deg] rounded-xl bg-emerald-300/80' />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='max-w-4xl'>

            {/* Stats bar */}
            <div className='mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
              {[
                { label: 'Questions',  value: totalQuestions,  color: 'text-slate-900' },
                { label: 'Answered',   value: attemptedCount,  color: 'text-emerald-600' },
                { label: 'Remaining',  value: totalQuestions - attemptedCount, color: 'text-amber-600' },
                { label: 'Time Left',  value: formatTime(remainingSeconds), color: timeWarning ? 'text-rose-600 animate-pulse' : 'text-slate-900' },
              ].map(s => (
                <div key={s.label} className='rounded-md border border-slate-200 bg-white p-3 text-center'>
                  <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
                  <p className='text-xs text-slate-500'>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className='mb-4'>
              <div className='mb-1.5 flex justify-between text-xs text-slate-500'>
                <span>Progress</span><span>{Math.round(progressPercent)}%</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-slate-200'>
                <motion.div className='h-full rounded-full bg-indigo-500'
                  initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>

            {/* Question navigator */}
            <div className='mb-4 flex flex-wrap gap-2'>
              {questions.map((q, idx) => {
                const answered = Boolean(answers[q.id])
                const isActive = activeQuestion === idx
                return (
                  <motion.button key={q.id} type='button' whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveQuestion(idx)}
                    className={`h-8 w-8 rounded border text-xs font-semibold transition-all focus:outline-none
                      ${isActive  ? 'border-indigo-600 bg-indigo-600 text-white'
                      : answered  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300'}`}>
                    {idx + 1}
                  </motion.button>
                )
              })}
            </div>

            {/* Active question card */}
            <AnimatePresence mode='wait'>
              {questions[activeQuestion] && (() => {
                const question = questions[activeQuestion]
                const options  = parseOptions(question.options)
                return (
                  <motion.div key={question.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className='rounded-md border border-slate-200 bg-white'>
                    <div className='p-5'>
                      <div className='mb-5 flex items-start justify-between gap-4'>
                        <div>
                          <p className='mb-2 text-xs font-medium text-slate-500'>
                            Question {activeQuestion + 1} of {totalQuestions}
                          </p>
                          <h3 className='text-base font-semibold leading-relaxed text-slate-900'>{question.question_text}</h3>
                        </div>
                        <span className='shrink-0 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800'>
                          {question.marks || 0} pts
                        </span>
                      </div>

                      <div className='space-y-3'>
                        {options.map((option, optionIndex) => {
                          const optionId    = option?.id || option?.option_id || option?.value || String(optionIndex)
                          const optionLabel = option?.text || option?.label || option?.value || String(option)
                          const checked     = answers[question.id] === optionId
                          return (
                            <motion.label key={`${question.id}-${optionId}`} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
                              className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-2.5 text-sm transition-all
                                ${checked
                                  ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'}`}>
                              <input type='radio' name={question.id} value={optionId} checked={checked}
                                onChange={() => handleSelectAnswer(question.id, optionId)} className='accent-indigo-600 h-4 w-4' />
                              <span className='font-bold text-slate-400 w-5 shrink-0'>{String.fromCharCode(65 + optionIndex)}.</span>
                              <span>{optionLabel}</span>
                            </motion.label>
                          )
                        })}
                      </div>

                      {/* Prev / Next */}
                      <div className='mt-5 flex gap-3'>
                        {activeQuestion > 0 && (
                          <button type='button' onClick={() => setActiveQuestion(q => q - 1)}
                            className='rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'>
                            ← Prev
                          </button>
                        )}
                        {activeQuestion < totalQuestions - 1 && (
                          <button type='button' onClick={() => setActiveQuestion(q => q + 1)}
                            className='ml-auto rounded border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-100'>
                            Next →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>

            {/* Submit bar */}
            <div className='mt-4 flex flex-wrap items-center gap-4 rounded-md border border-slate-200 bg-white p-4'>
              {attemptedCount !== totalQuestions && (
                <p className='flex-1 text-sm text-amber-700'>
                  Answer all questions before submitting ({totalQuestions - attemptedCount} remaining)
                </p>
              )}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type='button' onClick={handleSubmitQuiz}
                disabled={submittingQuiz || isCompleted || totalQuestions === 0 || attemptedCount !== totalQuestions}
                className='ml-auto rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'>
                {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
              </motion.button>
            </div>

            {/* Result panel */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className='mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-5 text-center'>
                <h4 className='text-lg font-semibold text-emerald-700'>Quiz Submitted</h4>
                <p className='mt-2 text-2xl font-bold text-slate-900'>
                  Score: <span className='text-indigo-600'>{result?.totalScore ?? 0}</span>
                </p>
                <p className='text-sm text-slate-500 mt-1'>{attemptedCount}/{totalQuestions} answered</p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type='button' onClick={() => navigate(`/course-page/${courseId}/quiz/${quizId}/leaderboard`)}
                  className='mt-4 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700'>
                  View Leaderboard
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default QuizPage