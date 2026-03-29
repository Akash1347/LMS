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
const PlayCircleIcon = ({ size = 20, active = false }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx='12' cy='12' r='10' />
    <polygon points='10 8 16 12 10 16 10 8' fill={active ? 'currentColor' : 'none'} strokeWidth='1.5' />
  </svg>
)
const DocIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
    <polyline points='14 2 14 8 20 8' />
    <line x1='16' y1='13' x2='8' y2='13' /><line x1='16' y1='17' x2='8' y2='17' /><line x1='10' y1='9' x2='8' y2='9' />
  </svg>
)
const QuizIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx='12' cy='12' r='10' />
    <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' /><line x1='12' y1='17' x2='12.01' y2='17' strokeWidth='2.5' />
  </svg>
)
const ChevronDown = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
    <polyline points='6 9 12 15 18 9' />
  </svg>
)
const CollapseIcon = () => (
  <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <polyline points='11 17 6 12 11 7' /><polyline points='18 17 13 12 18 7' />
  </svg>
)
const ExpandIcon = () => (
  <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <polyline points='13 17 18 12 13 7' /><polyline points='6 17 11 12 6 7' />
  </svg>
)
const BookIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' /><path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' />
  </svg>
)

/* ─── Helpers ────────────────────────────────────────────────────── */
const formatOrder  = (order, fallback = 0) => String(order ?? fallback).padStart(2, '0')
const isVideoUrl   = (url = '') => /\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(url)
const isImageUrl   = (url = '') => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)
const isPdfLikeUrl = (url = '') => /\.pdf(\?|$)/i.test(String(url || '')) || String(url || '').includes('/raw/upload/')

const getLessonType = (lesson) => {
  const d = String(lesson?.type || '').toLowerCase()
  const c = String(lesson?.content_ref || lesson?.video_url || '')
  if (d === 'quiz' || c.startsWith('quiz:')) return 'quiz'
  if (isVideoUrl(c) || d === 'video')        return 'video'
  return 'article'
}
const getLessonIcon = (type, active) => {
  if (type === 'video')   return <PlayCircleIcon size={19} active={active} />
  if (type === 'quiz')    return <QuizIcon size={19} />
  return <DocIcon size={19} />
}
const getLessonContentUrl = (l) => l?.video_url || l?.content_ref || ''
const getQuizIdFromRef    = (r = '') => String(r).startsWith('quiz:') ? String(r).split(':')[1] : null
const getPreviewUrl = (url = '', type = 'article') => {
  const n = String(url || '')
  if (type === 'video') {
    if (n.includes('/raw/upload/'))   return n.replace('/raw/upload/', '/video/upload/f_auto,vc_auto,q_auto/')
    if (n.includes('/video/upload/')) return n.replace('/video/upload/', '/video/upload/f_auto,vc_auto,q_auto/')
  }
  return n
}
const toGoogleViewerUrl = (url) => `https://docs.google.com/viewer?url=${encodeURIComponent(String(url || ''))}&embedded=true`

/* ─── PDF Viewer ─────────────────────────────────────────────────── */
const PdfViewer = ({ url, title }) => (
  <div className='flex h-full w-full flex-col overflow-hidden rounded-2xl'>
    <div className='relative flex-1'>
      <iframe key={url} title={title || 'PDF'} src={toGoogleViewerUrl(url)} className='absolute inset-0 h-full w-full' allow='autoplay' />
    </div>
    <div className='flex items-center justify-end border-t border-white/[0.06] bg-[#12151c]/80 px-4 py-2.5'>
      <a href={url} target='_blank' rel='noreferrer' className='text-xs font-medium text-[#8b95b0] hover:text-white transition-colors'>
        Open in new tab ↗
      </a>
    </div>
  </div>
)

/* ══════════════════════════════════════════════════════════════════ */
const CoursePage = () => {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { courseId } = useParams()
  const playerRef   = useRef(null)

  const [sidebarOpen,        setSidebarOpen]        = useState(true)
  const [openModuleId,       setOpenModuleId]       = useState(null)
  const [activeLesson,       setActiveLesson]       = useState(null)
  const [lessonCache,        setLessonCache]        = useState({})
  const [videoLoadError,     setVideoLoadError]     = useState(false)
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false)
  const [recentQuizResult,   setRecentQuizResult]   = useState(location.state?.quizResult || null)

  useEffect(() => {
    if (location.state?.quizResult) {
      setRecentQuizResult(location.state.quizResult)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const leaderboardQuizId = recentQuizResult?.quizId || null
  const { data: leaderboardData,    isLoading: leaderboardLoading } = useGetQuizLeaderboardHook(leaderboardQuizId, Boolean(leaderboardQuizId))
  const { data: detailedQuizAnalytics } = useGetQuizDetailedAnalyticsHook(leaderboardQuizId, Boolean(leaderboardQuizId))
  const leaderboardRows = useMemo(() => (Array.isArray(leaderboardData) ? leaderboardData : []), [leaderboardData])

  const { data: modulesData, isLoading: modulesLoading, error: modulesError } = useGetModulesByCourseIdHook(courseId)
  const modules = useMemo(() => (Array.isArray(modulesData?.data) ? modulesData.data : []), [modulesData])

  useEffect(() => { if (!openModuleId && modules.length > 0) setOpenModuleId(modules[0].id) }, [modules, openModuleId])

  const { data: lessonsData, isLoading: lessonsLoading, error: lessonsError } = useGetLessonsByModuleIdHook(openModuleId, Boolean(openModuleId))

  useEffect(() => {
    if (!openModuleId || !Array.isArray(lessonsData?.data)) return
    setLessonCache((prev) => ({ ...prev, [openModuleId]: lessonsData.data }))
    if (!activeLesson && lessonsData.data.length > 0) {
      const first = lessonsData.data.find((l) => getLessonType(l) !== 'quiz') || lessonsData.data[0]
      setActiveLesson(first)
    }
  }, [openModuleId, lessonsData, activeLesson])

  const allLessons      = useMemo(() => modules.flatMap((m) => lessonCache[m.id] || []), [modules, lessonCache])
  const activeLessonIdx = useMemo(() => allLessons.findIndex((l) => l?.id === activeLesson?.id), [allLessons, activeLesson])

  const goToPrev = () => { if (activeLessonIdx > 0) handleLessonSelect(allLessons[activeLessonIdx - 1]) }
  const goToNext = () => { if (activeLessonIdx < allLessons.length - 1) handleLessonSelect(allLessons[activeLessonIdx + 1]) }

  const handleToggleModule = (id) => setOpenModuleId((p) => (p === id ? null : id))
  const handleLessonSelect = (lesson) => {
    setVideoLoadError(false)
    if (getLessonType(lesson) === 'quiz') {
      const qid = getQuizIdFromRef(lesson?.content_ref)
      if (qid) { navigate(`/course-page/${courseId}/quiz/${qid}`); return }
    }
    setActiveLesson(lesson)
  }

  useEffect(() => {
    const fn = () => setIsPlayerFullscreen(Boolean(document.fullscreenElement && playerRef.current && document.fullscreenElement === playerRef.current))
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  const courseTitle = modules[0]?.course_title || modulesData?.course_title || 'Course Content'

  /* ── loading / error ── */
  if (modulesLoading) return (
    <div className='flex min-h-screen items-center justify-center bg-[#0e1117]'>
      <div className='h-7 w-7 animate-spin rounded-full border-2 border-[#6c8aff] border-t-transparent' />
    </div>
  )
  if (modulesError) return (
    <div className='flex min-h-screen items-center justify-center bg-[#0e1117]'>
      <p className='text-sm text-red-400'>Failed to load course: {modulesError.message}</p>
    </div>
  )

  /* ════════════════════════════════ RENDER ════════════════════════════════ */
  return (
    <div className='flex h-screen w-full overflow-hidden font-sans text-white' style={{ background: '#0e1117' }}>
      <style>{`
        /* ── scrollbar ── */
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: #2a2f3d; border-radius: 10px; }

        /* ── lesson hover ── */
        .lesson-btn { transition: background 0.14s ease; }
        .lesson-btn:hover { background: rgba(108,138,255,0.06); }
        .lesson-btn.active { background: rgba(108,138,255,0.10); }

        /* ── module hover ── */
        .module-btn:hover { background: rgba(255,255,255,0.025); }
      `}</style>

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className='flex h-full shrink-0 flex-col overflow-hidden border-r'
            style={{ minWidth: 0, background: '#13161f', borderColor: 'rgba(255,255,255,0.055)' }}
          >
            {/* ── Top bar ── */}
            <div className='flex items-center justify-between px-5 py-3.5 border-b' style={{ borderColor: 'rgba(255,255,255,0.055)' }}>
              <button
                onClick={() => navigate(-1)}
                className='flex items-center gap-2 text-sm font-medium transition-colors'
                style={{ color: '#8b95b0' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#8b95b0'}
              >
                ← Back to course page
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className='flex h-7 w-7 items-center justify-center rounded-xl transition-colors'
                style={{ color: '#545c72', background: 'rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#545c72'}
              >
                <CollapseIcon />
              </button>
            </div>

            {/* ── Course title + progress ── */}
            <div className='px-5 pt-5 pb-4 border-b' style={{ borderColor: 'rgba(255,255,255,0.055)' }}>
              <h1 className='text-base font-bold text-white leading-snug mb-3'>{courseTitle}</h1>
              <div className='flex items-center gap-3'>
                <div className='flex-1 h-1.5 overflow-hidden rounded-full' style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className='h-full rounded-full' style={{ width: '100%', background: 'linear-gradient(90deg, #6c8aff, #a78bfa)' }} />
                </div>
                <span className='text-xs font-semibold shrink-0' style={{ color: '#8b95b0' }}>100 %</span>
              </div>
            </div>

            {/* ── Module list ── */}
            <div className='sb-scroll flex-1 overflow-y-auto py-2'>
              {modules.length === 0 ? (
                <p className='py-10 text-center text-sm' style={{ color: '#545c72' }}>No modules found.</p>
              ) : (
                modules.map((mod, modIdx) => {
                  const isOpen  = openModuleId === mod?.id
                  const lessons = lessonCache[mod?.id] || []
                  const loading = isOpen && lessonsLoading && !lessonCache[mod?.id]

                  return (
                    <div key={mod?.id} className='mb-1 mx-2'>
                      {/* Module header */}
                      <button
                        type='button'
                        onClick={() => handleToggleModule(mod?.id)}
                        className='module-btn flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left focus:outline-none transition-colors'
                      >
                        <span className='text-sm font-medium leading-snug pr-4' style={{ color: isOpen ? '#e2e8f8' : '#8b95b0' }}>
                          {modIdx + 1}. {mod?.title || 'Untitled module'}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.22 }}
                          className='shrink-0 ml-1'
                          style={{ color: isOpen ? '#6c8aff' : '#545c72' }}
                        >
                          <ChevronDown />
                        </motion.span>
                      </button>

                      {/* Lesson list */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key='lessons'
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                            className='overflow-hidden'
                          >
                            <div className='mx-1 mb-1 overflow-hidden rounded-xl border' style={{ background: '#0e1117', borderColor: 'rgba(255,255,255,0.055)' }}>
                              {loading ? (
                                <div className='flex justify-center py-5'>
                                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' style={{ borderColor: '#6c8aff', borderTopColor: 'transparent' }} />
                                </div>
                              ) : lessonsError ? (
                                <p className='px-4 py-3 text-xs text-red-400'>Unable to load lessons.</p>
                              ) : lessons.length === 0 ? (
                                <p className='px-4 py-3 text-xs' style={{ color: '#545c72' }}>No lessons yet.</p>
                              ) : (
                                lessons.map((lesson, idx) => {
                                  const isActive   = activeLesson?.id === lesson?.id
                                  const lessonType = getLessonType(lesson)

                                  return (
                                    <button
                                      key={lesson?.id}
                                      onClick={() => handleLessonSelect(lesson)}
                                      className={`lesson-btn ${isActive ? 'active' : ''} flex w-full items-start gap-3.5 px-4 py-3 text-left focus:outline-none border-b last:border-b-0`}
                                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                                    >
                                      {/* Icon col */}
                                      <div className='flex flex-col items-center gap-0.5 pt-0.5 shrink-0'>
                                        <span style={{ color: isActive ? '#6c8aff' : '#545c72' }}>
                                          {getLessonIcon(lessonType, isActive)}
                                        </span>
                                        <span className='text-[9px]' style={{ color: isActive ? '#6c8aff' : '#3a4055' }}>✓</span>
                                      </div>

                                      {/* Text col */}
                                      <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium leading-snug truncate' style={{ color: isActive ? '#e2e8f8' : '#8b95b0' }}>
                                          {lesson?.title || `Lesson ${idx + 1}`}
                                        </p>
                                        <p className='mt-0.5 text-[11px] capitalize' style={{ color: '#3a4055' }}>{lessonType}</p>
                                      </div>

                                      {/* Duration */}
                                      {lesson?.duration && (
                                        <span className='shrink-0 text-[11px] tabular-nums pt-0.5' style={{ color: '#3a4055' }}>
                                          {lesson.duration}
                                        </span>
                                      )}
                                    </button>
                                  )
                                })
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══════════════════ MAIN AREA ══════════════════ */}
      <div className='flex flex-1 flex-col overflow-hidden'>

        {/* ── Top nav bar ── */}
        <div
          className='flex h-11 shrink-0 items-center relative border-b'
          style={{ background: '#13161f', borderColor: 'rgba(255,255,255,0.055)' }}
        >
          {/* Sidebar reopen */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className='absolute left-4 flex items-center gap-2 text-sm transition-colors rounded-lg px-2.5 py-1.5'
              style={{ color: '#8b95b0', background: 'rgba(255,255,255,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#8b95b0'}
            >
              <ExpandIcon />
            </button>
          )}

          {/* Previous */}
          <button
            onClick={goToPrev}
            disabled={activeLessonIdx <= 0}
            className='absolute left-1/4 -translate-x-1/2 flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition-all disabled:opacity-25 disabled:cursor-not-allowed'
            style={{ color: '#8b95b0' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = '#e2e8f8' }}
            onMouseLeave={e => e.currentTarget.style.color = '#8b95b0'}
          >
            ‹ previous
          </button>

          {/* Next */}
          <button
            onClick={goToNext}
            disabled={activeLessonIdx < 0 || activeLessonIdx >= allLessons.length - 1}
            className='absolute right-1/4 translate-x-1/2 flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition-all disabled:opacity-25 disabled:cursor-not-allowed'
            style={{ color: '#8b95b0' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = '#e2e8f8' }}
            onMouseLeave={e => e.currentTarget.style.color = '#8b95b0'}
          >
            next ›
          </button>
        </div>

        {/* ── Video / Content area ── */}
        <div className='flex-1 overflow-hidden' style={{ background: '#080a10' }}>
          {activeLesson ? (
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeLesson.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className='h-full w-full'
              >
                {(() => {
                  const lessonType    = getLessonType(activeLesson)
                  const rawContentUrl = getLessonContentUrl(activeLesson)
                  const contentUrl    = getPreviewUrl(rawContentUrl, lessonType)
                  const showPdf       = lessonType === 'article' && isPdfLikeUrl(rawContentUrl)

                  if (lessonType === 'quiz') return (
                    <div className='flex h-full flex-col items-center justify-center text-center p-8' style={{ background: '#0e1117' }}>
                      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl' style={{ background: 'rgba(108,138,255,0.1)', color: '#6c8aff', border: '1px solid rgba(108,138,255,0.2)' }}>
                        <QuizIcon size={30} />
                      </div>
                      <h3 className='text-xl font-semibold text-white mb-2'>Quiz: {activeLesson.title}</h3>
                      <p className='text-sm' style={{ color: '#545c72' }}>Select this quiz from the sidebar to start.</p>
                    </div>
                  )

                  if (lessonType === 'video') return contentUrl ? (
                    <div ref={playerRef} className='relative h-full w-full bg-black'>
                      <video
                        key={activeLesson.id}
                        controls
                        className='h-full w-full object-contain outline-none'
                        src={contentUrl}
                        onError={() => setVideoLoadError(true)}
                        onLoadedData={() => setVideoLoadError(false)}
                      />
                      {videoLoadError && (
                        <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-center backdrop-blur-sm'>
                          <p className='mb-4 text-sm' style={{ color: '#8b95b0' }}>Video format not supported.</p>
                          <a href={contentUrl} target='_blank' rel='noreferrer'
                            className='rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 transition-colors'>
                            Watch in new tab ↗
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='flex h-full items-center justify-center' style={{ color: '#545c72' }}>
                      <p className='text-sm'>No video URL provided</p>
                    </div>
                  )

                  if (lessonType === 'article') {
                    if (isImageUrl(contentUrl))  return <img src={contentUrl} alt={activeLesson?.title} className='h-full w-full object-contain' style={{ background: '#0e1117' }} />
                    if (isVideoUrl(contentUrl))  return <video controls className='h-full w-full bg-black object-contain' src={contentUrl} />
                    if (showPdf)                 return <PdfViewer url={rawContentUrl} title={activeLesson?.title} />
                    return (
                      <div className='relative h-full w-full bg-white'>
                        <iframe title={activeLesson?.title} src={contentUrl} className='h-full w-full border-none' />
                        <a href={rawContentUrl} target='_blank' rel='noreferrer'
                          className='absolute bottom-4 right-4 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg transition-colors'
                          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
                          Open in new tab ↗
                        </a>
                      </div>
                    )
                  }
                })()}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className='flex h-full flex-col items-center justify-center text-center' style={{ background: '#0e1117' }}>
              <div className='mb-5 flex h-20 w-20 items-center justify-center rounded-3xl' style={{ background: 'rgba(108,138,255,0.08)', color: '#3a4055', border: '1px solid rgba(108,138,255,0.12)' }}>
                <BookIcon size={30} />
              </div>
              <h2 className='text-xl font-bold text-white'>Ready to learn?</h2>
              <p className='mt-2 text-sm' style={{ color: '#545c72' }}>Select a module and lesson from the sidebar to begin.</p>
            </div>
          )}
        </div>

        {/* ── Post-Quiz banner ── */}
        {recentQuizResult && (
          <div
            className='shrink-0 flex items-center justify-between gap-4 border-t px-6 py-4'
            style={{ background: '#13161f', borderColor: 'rgba(255,255,255,0.055)' }}
          >
            <div>
              <p className='text-sm font-semibold text-white'>
                {recentQuizResult?.alreadyAttempted ? 'Quiz already attempted' : 'Quiz submitted'}
              </p>
              {!recentQuizResult?.alreadyAttempted && (
                <p className='text-xs mt-0.5' style={{ color: '#545c72' }}>
                  Score: <span className='text-white font-bold'>{recentQuizResult?.totalScore ?? 0}</span>
                  {' '}({recentQuizResult?.attemptedCount ?? 0}/{recentQuizResult?.totalQuestions ?? 0} answered)
                </p>
              )}
            </div>
            <button
              onClick={() => document.getElementById('cp-quiz-leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
              className='rounded-xl px-5 py-2 text-xs font-semibold text-white transition-colors'
              style={{ background: 'rgba(108,138,255,0.12)', border: '1px solid rgba(108,138,255,0.2)', color: '#a5b4fc' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,138,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,138,255,0.12)'}
            >
              View Leaderboard
            </button>
          </div>
        )}

        {/* ── Leaderboard ── */}
        {recentQuizResult?.quizId && (
          <div
            id='cp-quiz-leaderboard'
            className='sb-scroll shrink-0 max-h-80 overflow-y-auto border-t px-6 py-5'
            style={{ background: '#0e1117', borderColor: 'rgba(255,255,255,0.055)' }}
          >
            <div className='flex items-center justify-between mb-5'>
              <h3 className='text-sm font-bold text-white'>Leaderboard</h3>
              <div className='text-xs' style={{ color: '#545c72' }}>
                Avg: <span className='text-white font-semibold'>{Number(detailedQuizAnalytics?.stats?.average_score || 0).toFixed(1)}</span>
                {' '}· Attempts: <span className='text-white font-semibold'>{Number(detailedQuizAnalytics?.stats?.total_attempts || 0)}</span>
              </div>
            </div>
            {leaderboardLoading ? (
              <div className='flex justify-center py-4'>
                <span className='h-5 w-5 animate-spin rounded-full border-2 border-t-transparent' style={{ borderColor: '#6c8aff', borderTopColor: 'transparent' }} />
              </div>
            ) : leaderboardRows.length === 0 ? (
              <p className='text-center text-xs' style={{ color: '#545c72' }}>No results yet.</p>
            ) : (
              <div className='space-y-2'>
                {leaderboardRows.slice(0, 10).map((row, index) => (
                  <div
                    key={row.id || `${row.student_id}-${index}`}
                    className='flex items-center justify-between rounded-2xl px-4 py-3 border'
                    style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.055)' }}
                  >
                    <div className='flex items-center gap-3'>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold`}
                        style={{
                          background: index === 0 ? 'rgba(234,179,8,0.15)' : index === 1 ? 'rgba(148,163,184,0.15)' : index === 2 ? 'rgba(180,83,9,0.15)' : 'rgba(255,255,255,0.06)',
                          color:      index === 0 ? '#eab308'              : index === 1 ? '#94a3b8'              : index === 2 ? '#b45309'              : '#545c72',
                        }}>
                        {index + 1}
                      </span>
                      <span className='font-mono text-xs' style={{ color: '#8b95b0' }}>{row.student_id}</span>
                    </div>
                    <span className='text-sm font-bold text-white'>
                      {row.score} <span className='text-xs font-normal' style={{ color: '#3a4055' }}>pts</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursePage