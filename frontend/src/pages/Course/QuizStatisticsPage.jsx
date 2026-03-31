import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetQuizStatisticsHook, useGetQuizDetailedAnswersHook } from '@/hooks/course.hook'
import { motion, AnimatePresence } from 'framer-motion'

const QuizStatisticsPage = () => {
    const navigate = useNavigate()
    const { courseId, quizId } = useParams()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDetailedAnswers, setShowDetailedAnswers] = useState(false)

    const { data: statisticsData, isLoading: statsLoading, error: statsError } = useGetQuizStatisticsHook(quizId, Boolean(quizId))
    const { data: detailedAnswersData, isLoading: answersLoading, error: answersError } = useGetQuizDetailedAnswersHook(quizId, Boolean(showDetailedAnswers && quizId))

    const statistics = statisticsData?.data
    const detailedAnswers = detailedAnswersData?.data

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-emerald-600'
        if (percentage >= 60) return 'text-amber-600'
        return 'text-rose-600'
    }

    const getScoreBadge = (percentage) => {
        if (percentage >= 80) return { text: 'Excellent!', color: 'bg-emerald-100 text-emerald-700' }
        if (percentage >= 60) return { text: 'Good', color: 'bg-amber-100 text-amber-700' }
        return { text: 'Needs Improvement', color: 'bg-rose-100 text-rose-700' }
    }

    if (statsLoading) {
        return (
            <section className='min-h-screen bg-[#eceff4] px-4 py-8 sm:px-8'>
                <div className='mx-auto max-w-7xl'>
                    <div className='flex min-h-[320px] items-center justify-center'>
                        <div className='h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600' />
                    </div>
                </div>
            </section>
        )
    }

    if (statsError || !statistics) {
        const errorMessage = statsError?.response?.data?.message || "You haven't completed this quiz yet or statistics are not available.";
        const attemptStatus = statsError?.response?.data?.attempt_status;
        
        return (
            <section className='min-h-screen bg-[#eceff4] px-4 py-8 sm:px-8'>
                <div className='mx-auto max-w-7xl'>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className='mb-6 flex flex-wrap items-center justify-between gap-4'>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            type='button' onClick={() => navigate(`/course-page/${courseId}`)}
                            className='inline-flex items-center gap-2 text-slate-900'>
                            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}><polyline points='15 18 9 12 15 6' /></svg>
                            <span className='text-2xl font-semibold tracking-tight'>Back to Course</span>
                        </motion.button>
                    </motion.div>
                    <div className='rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm'>
                        <div className='mb-4 text-5xl'>{attemptStatus === 'in_progress' ? '⏳' : ''}</div>
                        <h3 className='text-2xl font-extrabold text-slate-900'>
                            {attemptStatus === 'in_progress' ? 'Quiz In Progress' : 'No Statistics Available'}
                        </h3>
                        <p className='mt-2 text-slate-500'>{errorMessage}</p>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            type='button' onClick={() => navigate(`/course-page/${courseId}/quiz/${quizId}`)}
                            className='mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700'>
                            {attemptStatus === 'in_progress' ? 'Continue Quiz' : 'Take Quiz'}
                        </motion.button>
                    </div>
                </div>
            </section>
        )
    }

    const scoreBadge = getScoreBadge(statistics.statistics.percentage)

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
                        <span className='text-2xl font-semibold tracking-tight'>Back to Course</span>
                    </motion.button>

                    <button
                        type='button'
                        onClick={() => navigate(`/course-page/${courseId}/quiz/${quizId}/leaderboard`)}
                        className='inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                    >
                        📊 View Leaderboard
                    </button>
                </motion.div>

                {/* Quiz Info Card */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className='mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                    <div className='p-6'>
                        <div className='flex flex-wrap items-start justify-between gap-4'>
                            <div>
                                <h1 className='text-3xl font-bold text-slate-900'>{statistics.quiz.title}</h1>
                                <p className='mt-1 text-slate-500'>{statistics.quiz.course_title}</p>
                            </div>
                            <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${scoreBadge.color}`}>
                                {scoreBadge.text}
                            </span>
                        </div>

                        {/* Score Display */}
                        <div className='mt-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-6'>
                            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between'>
                                <div className='text-center'>
                                    <p className='text-sm text-slate-500'>Your Score</p>
                                    <p className={`text-5xl font-extrabold ${getScoreColor(statistics.statistics.percentage)}`}>
                                        {statistics.statistics.percentage}%
                                    </p>
                                </div>
                                <div className='flex gap-8'>
                                    <div className='text-center'>
                                        <p className='text-2xl font-bold text-emerald-600'>{statistics.statistics.correct_answers}</p>
                                        <p className='text-xs text-slate-500'>Correct</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-2xl font-bold text-rose-600'>{statistics.statistics.wrong_answers}</p>
                                        <p className='text-xs text-slate-500'>Wrong</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-2xl font-bold text-indigo-600'>{statistics.statistics.total_marks_obtained}/{statistics.statistics.total_marks_available}</p>
                                        <p className='text-xs text-slate-500'>Marks</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className='mb-4 flex gap-2'>
                    {['overview', 'answers'].map((tab) => (
                        <button
                            key={tab}
                            type='button'
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {tab === 'overview' ? 'Overview' : 'Detailed Answers'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode='wait'>
                    {activeTab === 'overview' && (
                        <motion.div
                            key='overview'
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className='rounded-2xl border border-slate-200 bg-white shadow-sm'
                        >
                            <div className='p-6'>
                                <h3 className='mb-4 text-lg font-semibold text-slate-900'>Performance Summary</h3>
                                
                                {/* AI Summary */}
                                {statistics.ai_summary && statistics.ai_summary !== "Unable to generate AI summary at this time." && (
                                    <div className='mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4'>
                                        <div className='flex items-start gap-3'>
                                            <span className='text-2xl'>🤖</span>
                                            <div>
                                                <p className='text-sm font-medium text-slate-700'>AI Analysis</p>
                                                <p className='mt-1 text-sm text-slate-600'>{statistics.ai_summary}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Statistics Grid */}
                                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                                    <div className='rounded-lg border border-slate-200 p-4'>
                                        <p className='text-sm text-slate-500'>Total Questions</p>
                                        <p className='text-2xl font-bold text-slate-900'>{statistics.statistics.total_questions}</p>
                                    </div>
                                    <div className='rounded-lg border border-slate-200 p-4'>
                                        <p className='text-sm text-slate-500'>Correct Answers</p>
                                        <p className='text-2xl font-bold text-emerald-600'>{statistics.statistics.correct_answers}</p>
                                    </div>
                                    <div className='rounded-lg border border-slate-200 p-4'>
                                        <p className='text-sm text-slate-500'>Wrong Answers</p>
                                        <p className='text-2xl font-bold text-rose-600'>{statistics.statistics.wrong_answers}</p>
                                    </div>
                                    <div className='rounded-lg border border-slate-200 p-4'>
                                        <p className='text-sm text-slate-500'>Time Taken</p>
                                        <p className='text-2xl font-bold text-slate-900'>
                                            {statistics.attempt.submitted_at && statistics.attempt.started_at
                                                ? `${Math.round((new Date(statistics.attempt.submitted_at) - new Date(statistics.attempt.started_at)) / 60000)} min`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className='mt-6'>
                                    <div className='mb-2 flex justify-between text-sm'>
                                        <span className='text-slate-600'>Accuracy</span>
                                        <span className={`font-semibold ${getScoreColor(statistics.statistics.percentage)}`}>
                                            {statistics.statistics.percentage}%
                                        </span>
                                    </div>
                                    <div className='h-3 w-full overflow-hidden rounded-full bg-slate-200'>
                                        <motion.div
                                            className={`h-full rounded-full ${
                                                statistics.statistics.percentage >= 80 ? 'bg-emerald-500' :
                                                statistics.statistics.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                            }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${statistics.statistics.percentage}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'answers' && (
                        <motion.div
                            key='answers'
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className='space-y-4'
                        >
                            {statistics.answers.map((answer, index) => (
                                <motion.div
                                    key={answer.question_id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`rounded-2xl border p-5 shadow-sm ${
                                        answer.is_correct
                                            ? 'border-emerald-200 bg-emerald-50'
                                            : 'border-rose-200 bg-rose-50'
                                    }`}
                                >
                                    <div className='mb-3 flex items-start justify-between'>
                                        <span className='text-xs font-medium text-slate-500'>Question {index + 1}</span>
                                        <div className='flex items-center gap-2'>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                answer.is_correct
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {answer.is_correct ? '✓ Correct' : '✗ Wrong'}
                                            </span>
                                            <span className='rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800'>
                                                {answer.marks_awarded}/{answer.total_marks} pts
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className='mb-4 text-base font-semibold text-slate-900'>{answer.question_text}</h4>

                                    <div className='space-y-2'>
                                        <div className={`flex items-center gap-3 rounded-md border px-4 py-2.5 text-sm ${
                                            answer.is_correct
                                                ? 'border-emerald-300 bg-white'
                                                : 'border-rose-300 bg-white'
                                        }`}>
                                            <span className='font-bold text-slate-400'>Your Answer:</span>
                                            <span className={answer.is_correct ? 'text-emerald-700' : 'text-rose-700'}>
                                                {answer.selected_answer}
                                            </span>
                                            {answer.is_correct && <span className='ml-auto text-emerald-600'>✓</span>}
                                        </div>

                                        {!answer.is_correct && (
                                            <div className='flex items-center gap-3 rounded-md border border-emerald-300 bg-white px-4 py-2.5 text-sm'>
                                                <span className='font-bold text-slate-400'>Correct Answer:</span>
                                                <span className='text-emerald-700'>{answer.correct_answer}</span>
                                                <span className='ml-auto text-emerald-600'>✓</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* AI Detailed Breakdown */}
                            {showDetailedAnswers && detailedAnswers?.ai_breakdown && detailedAnswers.ai_breakdown !== "Unable to generate detailed breakdown at this time." && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
                                >
                                    <div className='flex items-start gap-3'>
                                        <span className='text-2xl'>🤖</span>
                                        <div>
                                            <p className='text-sm font-medium text-slate-700'>AI Detailed Breakdown</p>
                                            <p className='mt-1 text-sm text-slate-600 whitespace-pre-wrap'>{detailedAnswers.ai_breakdown}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Toggle for AI detailed answers */}
                            <div className='flex justify-center'>
                                <button
                                    type='button'
                                    onClick={() => setShowDetailedAnswers(!showDetailedAnswers)}
                                    className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                                >
                                    {showDetailedAnswers ? 'Hide AI Analysis' : 'Show AI Analysis'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className='mt-6 flex flex-wrap gap-4'>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type='button' onClick={() => navigate(`/course-page/${courseId}`)}
                        className='rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50'>
                        Back to Course
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type='button' onClick={() => navigate(`/course-page/${courseId}/quiz/${quizId}/leaderboard`)}
                        className='rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700'>
                        View Leaderboard
                    </motion.button>
                </div>
            </div>
        </section>
    )
}

export default QuizStatisticsPage