import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useGetLessonsByModuleIdHook,
  useGetModulesByCourseIdHook,
  useGetQuizDetailedAnalyticsHook,
  useGetQuizLeaderboardHook,
} from '@/hooks/course.hook'

/* ─── Icons ──────────────────────────────────────────────────────── */
const PlayIcon = ({ size = 18, filled = false }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill={filled ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth='1.5'>
    <polygon points='5 3 19 12 5 21 5 3' />
  </svg>
)

const BookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' />
    <path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' />
  </svg>
)

const QuizIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

/* ─── Helpers ────────────────────────────────────────────────────── */
const formatOrder  = (order, fallback = 0) => String(order ?? fallback).padStart(2, '0')
const isVideoUrl   = (url = '') => /\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(url)
const isImageUrl   = (url = '') => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)
const isPdfLikeUrl = (url = '') => /\.pdf(\?|$)/i.test(String(url || '')) || String(url || '').includes('/raw/upload/')

const getLessonType = (lesson) => {
  const declaredType = String(lesson?.type || '').toLowerCase()
  const contentRef   = String(lesson?.content_ref || lesson?.video_url || '')
  if (declaredType === 'quiz' || contentRef.startsWith('quiz:')) return 'quiz'
  if (isVideoUrl(contentRef) || declaredType === 'video')        return 'video'
  return 'article'
}

const getLessonContentUrl = (lesson) => lesson?.video_url || lesson?.content_ref || ''

const getQuizIdFromRef = (contentRef = '') => String(contentRef).startsWith('quiz:') ? String(contentRef).split(':')[1] : null

const getPreviewUrl = (url = '', lessonType = 'article') => {
  const n = String(url || '')
  if (lessonType === 'video') {
    if (n.includes('/raw/upload/')) return n.replace('/raw/upload/', '/video/upload/f_auto,vc_auto,q_auto/')
    if (n.includes('/video/upload/')) return n.replace('/video/upload/', '/video/upload/f_auto,vc_auto,q_auto/')
  }
  return n
}

const toGoogleViewerUrl = (url) => `https://docs.google.com/viewer?url=${encodeURIComponent(String(url || ''))}&embedded=true`

/* ─── PDF Viewer Component ───────────────────────────────────────── */
const PdfViewer = ({ url, title }) => {
  const googleUrl = toGoogleViewerUrl(url)
  return (
    <div className='flex h-[75vh] w-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl'>
      <div className='relative flex-1'>
        <iframe key={url} title={title || 'PDF viewer'} src={googleUrl} className='absolute inset-0 h-full w-full' allow='autoplay' />
      </div>
      <div className='flex items-center justify-end border-t border-zinc-800 bg-zinc-900/50 px-4 py-3'>
        <a href={url} target='_blank' rel='noreferrer' className='text-sm font-medium text-zinc-300 transition-colors hover:text-white'>
          ↗ Open PDF in new tab
        </a>
      </div>
    </div>
  )
}

/* ─── Main Page Component ────────────────────────────────────────── */
const CoursePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { courseId } = useParams()
  const playerRef = useRef(null)

  const [openModuleId, setOpenModuleId] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [lessonCache,  setLessonCache]  = useState({})
  const [videoLoadError, setVideoLoadError] = useState(false)
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false)
  const [recentQuizResult, setRecentQuizResult] = useState(location.state?.quizResult || null)

  useEffect(() => {
    if (location.state?.quizResult) {
      setRecentQuizResult(location.state.quizResult)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const leaderboardQuizId = recentQuizResult?.quizId || null
  const { data: leaderboardData, isLoading: leaderboardLoading } = useGetQuizLeaderboardHook(leaderboardQuizId, Boolean(leaderboardQuizId))
  const { data: detailedQuizAnalytics } = useGetQuizDetailedAnalyticsHook(leaderboardQuizId, Boolean(leaderboardQuizId))

  const leaderboardRows = useMemo(() => (Array.isArray(leaderboardData) ? leaderboardData : []), [leaderboardData])

  const { data: modulesData, isLoading: modulesLoading, error: modulesError } = useGetModulesByCourseIdHook(courseId)
  const modules = useMemo(() => (Array.isArray(modulesData?.data) ? modulesData.data : []), [modulesData])

  useEffect(() => {
    if (!openModuleId && modules.length > 0) setOpenModuleId(modules[0].id)
  }, [modules, openModuleId])

  const { data: lessonsData, isLoading: lessonsLoading, error: lessonsError } = useGetLessonsByModuleIdHook(openModuleId, Boolean(openModuleId))

  useEffect(() => {
    if (!openModuleId || !Array.isArray(lessonsData?.data)) return
    setLessonCache((prev) => ({ ...prev, [openModuleId]: lessonsData.data }))
    if (!activeLesson && lessonsData.data.length > 0) {
      const first = lessonsData.data.find((l) => getLessonType(l) !== 'quiz') || lessonsData.data[0]
      setActiveLesson(first)
    }
  }, [openModuleId, lessonsData, activeLesson])

  const handleToggleModule = (id) => setOpenModuleId((prev) => (prev === id ? null : id))

  const handleLessonSelect = (lesson) => {
    setVideoLoadError(false)
    if (getLessonType(lesson) === 'quiz') {
      const quizId = getQuizIdFromRef(lesson?.content_ref)
      if (quizId) {
        navigate(`/course-page/${courseId}/quiz/${quizId}`)
        return
      }
    }
    setActiveLesson(lesson)
  }

  const togglePlayerFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await playerRef.current?.requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch (_error) {}
  }

  useEffect(() => {
    const onChange = () => {
      const fsElement = document.fullscreenElement
      setIsPlayerFullscreen(Boolean(fsElement && playerRef.current && fsElement === playerRef.current))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (modulesLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-zinc-950'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-transparent'></div>
      </div>
    )
  }

  if (modulesError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-zinc-950'>
        <p className='text-sm text-red-400'>Failed to load course: {modulesError.message}</p>
      </div>
    )
  }

  return (
    <div className='flex h-screen w-full bg-zinc-950 font-sans text-zinc-100 selection:bg-zinc-800'>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
      `}</style>

      {/* ════════════ LEFT SIDEBAR ════════════ */}
      <aside className='flex w-80 shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md'>
        <div className='flex items-center justify-between border-b border-zinc-800/60 p-6'>
          <h2 className='text-base font-semibold tracking-tight text-white'>Course Content</h2>
          <span className='rounded-full border border-zinc-700 bg-zinc-800/50 px-2.5 py-0.5 text-xs font-medium text-zinc-300'>
            {modules.length} Modules
          </span>
        </div>

        <div className='custom-scrollbar flex-1 overflow-y-auto px-3 py-4'>
          {modules.length === 0 ? (
            <p className='text-center text-sm text-zinc-500 mt-10'>No modules found.</p>
          ) : (
            <div className='space-y-2'>
              {modules.map((mod) => {
                const isOpen  = openModuleId === mod?.id
                const lessons = lessonCache[mod?.id] || []
                const loading = isOpen && lessonsLoading && !lessonCache[mod?.id]

                return (
                  <div key={mod?.id} className='overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30 transition-colors'>
                    <button
                      type='button'
                      onClick={() => handleToggleModule(mod?.id)}
                      className='flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-zinc-800/40 focus:outline-none'
                    >
                      <div className='flex items-center gap-3 pr-4'>
                        <span className='text-xs font-medium text-zinc-500'>M{formatOrder(mod?.order_index)}</span>
                        <span className={`text-sm font-medium leading-snug ${isOpen ? 'text-white' : 'text-zinc-300'}`}>
                          {mod?.title || 'Untitled module'}
                        </span>
                      </div>
                      <motion.svg 
                        animate={{ rotate: isOpen ? 180 : 0 }} 
                        className='h-4 w-4 shrink-0 text-zinc-500' 
                        fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'
                      >
                        <polyline points='6 9 12 15 18 9' />
                      </motion.svg>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className='overflow-hidden border-t border-zinc-800/40 bg-black/20'
                        >
                          <div className='px-2 py-2'>
                            {loading ? (
                              <div className='flex items-center justify-center py-4'>
                                <span className='h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent'></span>
                              </div>
                            ) : lessonsError ? (
                              <p className='px-4 py-2 text-xs text-red-400'>Unable to load lessons.</p>
                            ) : lessons.length === 0 ? (
                              <p className='px-4 py-2 text-xs text-zinc-500'>No lessons in this module yet.</p>
                            ) : (
                              <div className='space-y-1'>
                                {lessons.map((lesson, idx) => {
                                  const isActive   = activeLesson?.id === lesson?.id
                                  const lessonType = getLessonType(lesson)
                                  
                                  return (
                                    <button
                                      key={lesson?.id}
                                      onClick={() => handleLessonSelect(lesson)}
                                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all focus:outline-none ${
                                        isActive 
                                          ? 'bg-white text-zinc-950 shadow-sm' 
                                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                      }`}
                                    >
                                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium transition-colors ${isActive ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-800/50 text-zinc-500 group-hover:bg-zinc-700'}`}>
                                        {isActive && lessonType === 'video' ? <PlayIcon size={10} filled /> : idx + 1}
                                      </span>
                                      
                                      <span className='flex-1 truncate leading-tight'>
                                        {lesson?.title || `Lesson ${idx + 1}`}
                                      </span>

                                      <span className={`shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${
                                        isActive ? 'bg-zinc-200 text-zinc-600' : 'border border-zinc-700 bg-zinc-800/30 text-zinc-500'
                                      }`}>
                                        {lessonType}
                                      </span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ════════════ MAIN CONTENT ════════════ */}
      <main className='custom-scrollbar flex flex-1 flex-col overflow-y-auto bg-zinc-950'>
        {activeLesson ? (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeLesson.id}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className='mx-auto w-full max-w-6xl px-8 py-10'
            >
              
              {/* Top Navigation Row */}
              <div className='mb-6 flex items-center justify-between'>
                <button onClick={() => navigate(-1)} className='flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white'>
                  ← Back to Course
                </button>
                <div className='flex gap-3'>
                  <button onClick={togglePlayerFullscreen} className='rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white'>
                    {isPlayerFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  </button>
                </div>
              </div>

              {/* Media Player Area */}
              <div ref={playerRef} className={`relative mb-8 w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/5 shadow-2xl ${isPlayerFullscreen ? 'h-screen w-screen rounded-none border-none ring-0' : 'aspect-[16/9]'}`}>
                {(() => {
                  const lessonType    = getLessonType(activeLesson)
                  const rawContentUrl = getLessonContentUrl(activeLesson)
                  const contentUrl    = getPreviewUrl(rawContentUrl, lessonType)
                  const showPdf       = lessonType === 'article' && isPdfLikeUrl(rawContentUrl)

                  if (lessonType === 'quiz') {
                    return (
                      <div className='flex h-full flex-col items-center justify-center bg-zinc-900/50 p-8 text-center backdrop-blur-sm'>
                        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-white'>
                          <QuizIcon size={32} />
                        </div>
                        <h3 className='mb-2 text-2xl font-semibold text-white'>Quiz: {activeLesson.title}</h3>
                        <p className='text-zinc-400'>Select this quiz from the sidebar to test your knowledge.</p>
                      </div>
                    )
                  }

                  if (lessonType === 'video') {
                    return contentUrl ? (
                      <video
                        key={activeLesson.id}
                        controls
                        className='h-full w-full bg-black object-contain outline-none'
                        src={contentUrl}
                        onError={() => setVideoLoadError(true)}
                        onLoadedData={() => setVideoLoadError(false)}
                      />
                    ) : (
                      <div className='flex h-full flex-col items-center justify-center text-zinc-500'>
                        <PlayIcon size={48} filled />
                        <span className='mt-4 text-sm font-medium'>No video URL provided</span>
                      </div>
                    )
                  }

                  if (lessonType === 'article') {
                    if (isImageUrl(contentUrl)) {
                      return <img src={contentUrl} alt={activeLesson?.title} className='h-full w-full object-contain bg-zinc-900/50' />
                    }
                    if (isVideoUrl(contentUrl)) {
                      return <video controls className='h-full w-full bg-black object-contain' src={contentUrl} />
                    }
                    if (showPdf) {
                      return <PdfViewer url={rawContentUrl} title={activeLesson?.title} />
                    }
                    return (
                      <div className='h-full w-full bg-white'>
                        <iframe title={activeLesson?.title} src={contentUrl} className='h-full w-full border-none' />
                        <div className='absolute bottom-4 right-4'>
                          <a href={rawContentUrl} target='_blank' rel='noreferrer' className='rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-lg hover:bg-zinc-800'>
                            Open in new tab ↗
                          </a>
                        </div>
                      </div>
                    )
                  }
                })()}

                {/* Video Error Fallback */}
                {videoLoadError && (
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-center backdrop-blur-md'>
                    <p className='mb-4 text-sm text-zinc-300'>Video format not supported in browser.</p>
                    <a href={getPreviewUrl(getLessonContentUrl(activeLesson), 'video')} target='_blank' rel='noreferrer' className='rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200'>
                      Watch in new tab ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Post-Quiz State Bar */}
              {recentQuizResult && (
                <div className='mb-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 sm:flex-row sm:items-center'>
                  <div>
                    <h3 className='text-lg font-semibold text-white'>
                      {recentQuizResult?.alreadyAttempted ? 'Quiz already attempted' : 'Quiz submitted successfully'}
                    </h3>
                    {!recentQuizResult?.alreadyAttempted && (
                      <p className='mt-1 text-sm text-zinc-400'>
                        Score: <span className='font-bold text-white'>{recentQuizResult?.totalScore ?? 0}</span>
                        {' '}— ({recentQuizResult?.attemptedCount ?? 0}/{recentQuizResult?.totalQuestions ?? 0} answered)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => document.getElementById('cp-quiz-leaderboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className='rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200'
                  >
                    View Leaderboard
                  </button>
                </div>
              )}

              {/* Lesson Metadata */}
              <div className='max-w-4xl'>
                <div className='mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-zinc-500'>
                  <span>Lesson {formatOrder(activeLesson?.order_index, 1)}</span>
                  <span className='h-1 w-1 rounded-full bg-zinc-700'></span>
                  <span>{getLessonType(activeLesson)}</span>
                </div>
                <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>{activeLesson?.title || 'Untitled lesson'}</h1>
                {activeLesson?.description && (
                  <p className='mt-6 text-base leading-relaxed text-zinc-400'>{activeLesson.description}</p>
                )}
              </div>

              {/* Leaderboard Section */}
              {recentQuizResult?.quizId && (
                <div id='cp-quiz-leaderboard' className='mt-16 max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8'>
                  <div className='mb-8 flex items-end justify-between border-b border-zinc-800 pb-6'>
                    <div>
                      <h3 className='text-2xl font-bold text-white'>Leaderboard</h3>
                      <p className='mt-1 text-sm text-zinc-500'>Quiz ID: <span className='font-mono'>{recentQuizResult.quizId}</span></p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-zinc-400'>Total Attempts: <span className='font-semibold text-white'>{Number(detailedQuizAnalytics?.stats?.total_attempts || 0)}</span></p>
                      <p className='text-sm text-zinc-400'>Avg Score: <span className='font-semibold text-white'>{Number(detailedQuizAnalytics?.stats?.average_score || 0).toFixed(2)}</span></p>
                    </div>
                  </div>

                  {leaderboardLoading ? (
                    <div className='flex justify-center py-8'><span className='h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent'></span></div>
                  ) : leaderboardRows.length === 0 ? (
                    <p className='text-center text-sm text-zinc-500 py-8'>No leaderboard data yet.</p>
                  ) : (
                    <div className='space-y-3'>
                      {leaderboardRows.slice(0, 10).map((row, index) => (
                        <div key={row.id || `${row.student_id}-${index}`} className='flex items-center justify-between rounded-xl bg-zinc-800/40 px-6 py-4'>
                          <div className='flex items-center gap-4'>
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-zinc-300/20 text-zinc-300' : index === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-zinc-800 text-zinc-500'}`}>
                              #{index + 1}
                            </span>
                            <span className='font-mono text-sm text-zinc-300'>{row.student_id}</span>
                          </div>
                          <span className='font-bold text-white'>{row.score} <span className='text-xs font-normal text-zinc-500'>pts</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        ) : (
          /* Placeholder */
          <div className='flex h-full flex-col items-center justify-center text-center'>
            <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900/50 ring-1 ring-zinc-800'>
              <BookIcon size={32} />
            </div>
            <h2 className='text-2xl font-bold tracking-tight text-white'>Ready to learn?</h2>
            <p className='mt-2 text-zinc-500'>Select a module and lesson from the sidebar to begin.</p>
          </div>
        )}
      </main>

    </div>
  )
}

export default CoursePage