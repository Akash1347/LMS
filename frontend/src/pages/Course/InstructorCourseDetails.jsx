import React, { useMemo, useState } from 'react'
import {
  useCreateLessonHook, useCreateModuleHook, useDeleteLessonHook, useDeleteModuleHook,
  useGetCourseDetailsHook, useGetLessonsByModuleIdHook, useGetModulesByCourseIdHook,
  useUpdateCourseHook, useUpdateModuleHook,
} from '@/hooks/course.hook'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import InstructorQuizCreationForm from './InstructorQuizCreationForm'
import { motion, AnimatePresence } from 'framer-motion'

const LESSON_MAX_FILE_SIZE_MB    = 70
const LESSON_MAX_FILE_SIZE_BYTES = LESSON_MAX_FILE_SIZE_MB * 1024 * 1024

const INITIAL_COURSE_FORM     = { title: '', description: '', level: 'beginner', language: 'english', price: 0, currency: 'INR' }
const INITIAL_NEW_MODULE_FORM = { title: '', order_index: '' }
const INITIAL_LESSON_FORM     = { title: '', type: 'article', order_index: '', file: null }

const formatOrder = (value) => String(value).padStart(2, '0')

const getLessonDisplayType = (lesson = {}) => {
  const contentRef = String(lesson?.content_ref || '')
  if (contentRef.startsWith('quiz:')) return 'quiz'
  return lesson?.type || 'article'
}

const getLessonPublicId = (contentRef = '') => {
  const value = String(contentRef || ''), marker = '/upload/'
  const idx = value.indexOf(marker)
  if (idx === -1) return ''
  const after = value.slice(idx + marker.length)
  const parts = after.split('/').filter(Boolean)
  const clean = parts[0]?.startsWith('v') ? parts.slice(1) : parts
  return clean.join('/').replace(/\.[a-z0-9]+$/i, '')
}

const typePillCls = {
  video:   'bg-emerald-100 text-emerald-700',
  article: 'bg-indigo-100  text-indigo-700',
  quiz:    'bg-amber-100   text-amber-700',
}

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'

/* ─── icons ── */
const PlusIcon  = () => (<svg width='14' height='14' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg>)
const EditIcon  = () => (<svg width='13' height='13' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/></svg>)
const TrashIcon = () => (<svg width='13' height='13' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><polyline points='3 6 5 6 21 6'/><path d='M19 6l-1 14H6L5 6'/><path d='M10 11v6'/><path d='M14 11v6'/><path d='M9 6V4h6v2'/></svg>)
const SaveIcon  = () => (<svg width='13' height='13' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg>)
const XIcon       = () => (<svg width='13' height='13' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>)
const ChevronIcon = ({ open }) => (
  <svg className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
    <polyline points='6 9 12 15 18 9' />
  </svg>
)

const InstructorCourseDetails = () => {
  const navigate = useNavigate()
  const { courseId } = useParams()

  const { data: courseResponse, isLoading: loadingCourse }                        = useGetCourseDetailsHook(courseId)
  const { data: modulesResponse, isLoading: loadingModules, refetch: refetchModules } = useGetModulesByCourseIdHook(courseId)
  const { mutate: updateCourse, isPending: updatingCourse }   = useUpdateCourseHook()
  const { mutate: createModule, isPending: creatingModule }   = useCreateModuleHook()
  const { mutate: updateModule, isPending: updatingModule }   = useUpdateModuleHook()
  const { mutate: deleteModule, isPending: deletingModule }   = useDeleteModuleHook()
  const { mutate: createLesson, isPending: creatingLesson }   = useCreateLessonHook()
  const { mutate: deleteLesson, isPending: deletingLesson }   = useDeleteLessonHook()

  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [editingModuleId, setEditingModuleId]   = useState(null)
  const [showAddModule, setShowAddModule]       = useState(false)
  const [showAddLesson, setShowAddLesson]       = useState(false)
  const [showAddQuiz, setShowAddQuiz]           = useState(false)
  const [showCourseForm, setShowCourseForm]     = useState(false)
  const [uploadPercent, setUploadPercent]       = useState(0)
  const [localPreviewUrl, setLocalPreviewUrl]   = useState('')
  const [lessonCache, setLessonCache]           = useState({})

  const [courseForm, setCourseForm] = useState(INITIAL_COURSE_FORM)
  const [moduleForm, setModuleForm] = useState(INITIAL_NEW_MODULE_FORM)
  const [newModule, setNewModule]   = useState(INITIAL_NEW_MODULE_FORM)
  const [lessonForm, setLessonForm] = useState(INITIAL_LESSON_FORM)

  const courseDetails = courseResponse?.data || {}
  const course  = courseDetails?.course || null
  const modules = useMemo(() => (Array.isArray(modulesResponse?.data) ? modulesResponse.data : []), [modulesResponse])

  const { data: lessonsResponse, isLoading: loadingLessons, refetch: refetchLessons } =
    useGetLessonsByModuleIdHook(selectedModuleId, Boolean(selectedModuleId))
  const lessons = useMemo(() => (Array.isArray(lessonsResponse?.data) ? lessonsResponse.data : []), [lessonsResponse])
  const nextLessonOrderIndex = useMemo(() => {
    if (!lessons.length) return 1
    return lessons.reduce((max, l) => Math.max(max, Number(l?.order_index || 0)), 0) + 1
  }, [lessons])

  React.useEffect(() => {
    if (!course) return
    setCourseForm({ title: course.title || '', description: course.description || '', level: course.level || 'beginner', language: course.language || 'english', price: course.price || 0, currency: course.currency || 'INR' })
  }, [course])

  React.useEffect(() => {
    if (!selectedModuleId && modules.length > 0) setSelectedModuleId(modules[0].id)
  }, [modules, selectedModuleId])

  React.useEffect(() => {
    if (!editingModuleId) return
    const mod = modules.find(m => m.id === editingModuleId)
    if (mod) setModuleForm({ title: mod.title || '', order_index: mod.order_index || '' })
  }, [editingModuleId, modules])

  React.useEffect(() => {
    if (!lessonForm.file) { setLocalPreviewUrl(''); return }
    const objectUrl = URL.createObjectURL(lessonForm.file)
    setLocalPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [lessonForm.file])

  // Cache lessons per module so accordion shows them after toggling
  React.useEffect(() => {
    if (!selectedModuleId || !Array.isArray(lessonsResponse?.data)) return
    setLessonCache(prev => ({ ...prev, [selectedModuleId]: lessonsResponse.data }))
  }, [selectedModuleId, lessonsResponse])

  const onUpdateCourse = (e) => {
    e.preventDefault()
    updateCourse({ courseId, payload: { ...courseForm, price: Number(courseForm.price) } }, { onSuccess: () => setShowCourseForm(false) })
  }
  const onCreateModule = (e) => {
    e.preventDefault()
    createModule({ courseId, payload: { title: newModule.title, order_index: Number(newModule.order_index) } }, {
      onSuccess: async () => { setNewModule(INITIAL_NEW_MODULE_FORM); setShowAddModule(false); await refetchModules() }
    })
  }
  const onUpdateModule = (e) => {
    e.preventDefault()
    if (!editingModuleId) return
    updateModule({ moduleId: editingModuleId, payload: { title: moduleForm.title, order_index: Number(moduleForm.order_index) } }, {
      onSuccess: async () => { setEditingModuleId(null); await refetchModules() }
    })
  }
  const onDeleteModule = (id) => {
    deleteModule(id, { onSuccess: async () => { if (selectedModuleId === id) setSelectedModuleId(null); await refetchModules() } })
  }
  const onCreateLesson = (e) => {
    e.preventDefault()
    if (!selectedModuleId) return
    if (!lessonForm.file) { toast.error('Please select a file'); return }
    if (lessonForm.file.size > LESSON_MAX_FILE_SIZE_BYTES) { toast.error(`Max ${LESSON_MAX_FILE_SIZE_MB}MB`); return }
    const fd = new FormData()
    fd.append('title', lessonForm.title)
    fd.append('type', lessonForm.type)
    fd.append('order_index', String(Number(lessonForm.order_index)))
    if (lessonForm.file) fd.append('file', lessonForm.file)
    createLesson({
      moduleId: selectedModuleId, payload: fd,
      onUploadProgress: (e) => { const t = Number(e?.total || 0), l = Number(e?.loaded || 0); if (t > 0) setUploadPercent(Math.min(100, Math.round((l/t)*100))) },
    }, {
      onSuccess: async () => { setLessonForm(INITIAL_LESSON_FORM); setShowAddLesson(false); setUploadPercent(0); await refetchLessons() },
      onError: () => setUploadPercent(0),
    })
  }
  const onDeleteLesson = (lesson) => {
    deleteLesson({ lessonId: lesson?.id, payload: { public_id: getLessonPublicId(lesson?.content_ref) } }, { onSuccess: async () => await refetchLessons() })
  }

  const selectedModule = modules.find(m => m.id === selectedModuleId)

  if (loadingCourse || loadingModules) return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50'>
      <div className='h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600' />
    </div>
  )
  if (!course) return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50'>
      <p className='text-rose-500'>Course not found.</p>
    </div>
  )

  const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400'

  return (
    <div className='min-h-screen bg-slate-50'>

      {/* Top bar */}
      <header className='sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-3.5 shadow-sm'>
        <div className='mx-auto flex max-w-7xl items-center gap-4'>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/instructor-course')}
            className='inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50'>
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}><polyline points='15 18 9 12 15 6'/></svg>
            Back
          </motion.button>
          <div className='flex-1'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-indigo-500'>Course</p>
            <h1 className='text-base font-extrabold text-slate-900 truncate'>{course.title}</h1>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCourseForm(v => !v)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${showCourseForm ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <EditIcon /> {showCourseForm ? 'Cancel' : 'Edit Course'}
          </motion.button>
        </div>
      </header>

      {/* Course edit panel */}
      <AnimatePresence>
        {showCourseForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className='overflow-hidden border-b border-slate-200 bg-white'>
            <form onSubmit={onUpdateCourse} className='mx-auto max-w-7xl px-5 py-5'>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-4'>
                {[
                  { key: 'title', label: 'Title', span: 'lg:col-span-2' },
                  { key: 'level', label: 'Level' }, { key: 'language', label: 'Language' },
                  { key: 'price', label: 'Price', type: 'number' }, { key: 'currency', label: 'Currency' },
                ].map(f => (
                  <div key={f.key} className={f.span || ''}>
                    <label className={labelCls}>{f.label}</label>
                    <input className={inputCls} type={f.type || 'text'} value={courseForm[f.key]}
                      onChange={e => setCourseForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className='col-span-2 sm:col-span-3 lg:col-span-6'>
                  <label className={labelCls}>Description</label>
                  <textarea className={`${inputCls} resize-none`} rows={2} value={courseForm.description}
                    onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} type='submit' disabled={updatingCourse}
                className='rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60'>
                {updatingCourse ? 'Saving…' : 'Save Course'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div className='mx-auto grid max-w-7xl grid-cols-[300px_1fr] gap-0 px-0'>

        {/* ════ Left: Modules ════ */}
        <div className='flex min-h-[calc(100vh-60px)] flex-col border-r border-slate-200 bg-white'>
          <div className='flex items-center gap-2 border-b border-slate-100 px-4 py-3 sticky top-[61px] bg-white z-[5]'>
            <span className='flex-1 text-xs font-bold uppercase tracking-wider text-slate-500'>Modules</span>
            <span className='rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700'>{modules.length}</span>
          </div>

          <div className='flex-1 overflow-y-auto py-2'>
            {modules.length === 0 && <p className='px-4 py-3 text-sm text-slate-400'>No modules yet.</p>}
            {modules.map((mod, idx) => {
              const isSelected = selectedModuleId === mod.id
              const isEditing  = editingModuleId === mod.id
              return (
                <motion.div key={mod.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                  {isEditing ? (
                    <form onSubmit={onUpdateModule} className='flex items-center gap-2 border-b border-slate-100 bg-indigo-50 px-3 py-2.5'>
                      <input className={`${inputCls} flex-1`} value={moduleForm.title} autoFocus
                        onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))} placeholder='Module title' />
                      <input className={`${inputCls} w-16`} type='number' value={moduleForm.order_index}
                        onChange={e => setModuleForm(p => ({ ...p, order_index: e.target.value }))} placeholder='#' />
                      <button type='submit' disabled={updatingModule}
                        className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700'><SaveIcon /></button>
                      <button type='button' onClick={() => setEditingModuleId(null)}
                        className='flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100'><XIcon /></button>
                    </form>
                  ) : (
                    <div onClick={() => setSelectedModuleId(mod.id)}
                      className={`group flex cursor-pointer items-center gap-3 border-b border-slate-50 px-4 py-3 transition-colors ${isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50'}`}>
                      <span className='w-6 font-mono text-xs font-bold text-indigo-400'>{formatOrder(mod.order_index)}</span>
                      <span className={`flex-1 text-sm ${isSelected ? 'font-semibold text-indigo-700' : 'text-slate-700'}`}>{mod.title}</span>
                      <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100' onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditingModuleId(mod.id); setSelectedModuleId(mod.id) }}
                          className='flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'><EditIcon /></button>
                        <button disabled={deletingModule} onClick={() => onDeleteModule(mod.id)}
                          className='flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600'><TrashIcon /></button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Add module */}
          <div className='border-t border-slate-100 p-3'>
            <AnimatePresence>
              {showAddModule ? (
                <motion.form key='form' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={onCreateModule} className='flex flex-col gap-2'>
                  <input className={inputCls} value={newModule.title} autoFocus placeholder='Module title'
                    onChange={e => setNewModule(p => ({ ...p, title: e.target.value }))} />
                  <div className='flex gap-2'>
                    <input className={`${inputCls} flex-1`} type='number' value={newModule.order_index} placeholder='Order #'
                      onChange={e => setNewModule(p => ({ ...p, order_index: e.target.value }))} />
                    <button type='submit' disabled={creatingModule}
                      className='rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60'>
                      {creatingModule ? '…' : 'Add'}
                    </button>
                    <button type='button' onClick={() => setShowAddModule(false)}
                      className='rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50'>×</button>
                  </div>
                </motion.form>
              ) : (
                <motion.button key='btn' initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setShowAddModule(true)}
                  className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600'>
                  <PlusIcon /> Add Module
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ════ Right: Lessons ════ */}
        <div className='min-h-[calc(100vh-60px)] overflow-y-auto p-6'>
          {!selectedModule ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-sm text-slate-400'>Select a module to manage its lessons</p>
            </div>
          ) : (
            <motion.div key={selectedModule.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

              {/* Module header */}
              <div className='mb-5 flex items-center gap-3'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-mono text-xs font-bold text-indigo-700'>
                  {formatOrder(selectedModule.order_index)}
                </span>
                <h2 className='text-lg font-extrabold text-slate-900'>{selectedModule.title}</h2>
              </div>

              {/* Lessons */}
              <div className='mb-5 space-y-2'>
                {loadingLessons ? (
                  <div className='flex gap-1.5 py-2'>
                    {[0,1,2].map(i => <span key={i} className='h-2 w-2 animate-bounce rounded-full bg-indigo-400' style={{ animationDelay: `${i*0.15}s` }} />)}
                  </div>
                ) : lessons.length === 0 ? (
                  <p className='text-sm text-slate-400'>No lessons yet.</p>
                ) : (
                  lessons.map((lesson, idx) => {
                    const displayType = getLessonDisplayType(lesson)
                    return (
                      <motion.div key={lesson.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className='group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md'>
                        <span className='w-6 font-mono text-xs font-bold text-indigo-400'>{formatOrder(lesson.order_index)}</span>
                        <span className='flex-1 text-sm font-medium text-slate-800'>{lesson.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${typePillCls[displayType] || typePillCls.article}`}>{displayType}</span>
                        <button disabled={deletingLesson} onClick={() => onDeleteLesson(lesson)}
                          className='flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600'>
                          <TrashIcon />
                        </button>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Add lesson form */}
              <AnimatePresence>
                {showAddLesson && (
                  <motion.form key='lesson-form' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    onSubmit={onCreateLesson}
                    className='mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                    <div className='h-1 -mx-5 -mt-5 mb-5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent' />
                    <p className='mb-4 text-xs font-bold uppercase tracking-wider text-slate-400'>New Lesson</p>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                      <div className='sm:col-span-2'>
                        <label className='mb-1 block text-xs font-semibold text-slate-500'>Title</label>
                        <input className={inputCls} value={lessonForm.title} autoFocus placeholder='Lesson title'
                          onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))} />
                      </div>
                      <div>
                        <label className='mb-1 block text-xs font-semibold text-slate-500'>Type</label>
                        <select className={inputCls} value={lessonForm.type}
                          onChange={e => setLessonForm(p => ({ ...p, type: e.target.value }))}>
                          <option value='article'>Article</option>
                          <option value='video'>Video</option>
                        </select>
                      </div>
                      <div>
                        <label className='mb-1 block text-xs font-semibold text-slate-500'>Order #</label>
                        <input className={inputCls} type='number' value={lessonForm.order_index} placeholder='1'
                          onChange={e => setLessonForm(p => ({ ...p, order_index: e.target.value }))} />
                      </div>
                      <div className='sm:col-span-2'>
                        <label className='mb-1 block text-xs font-semibold text-slate-500'>File</label>
                        <input type='file' accept='video/*,.pdf,image/*'
                          className='w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-700'
                          onChange={e => {
                            const f = e.target.files?.[0] || null
                            const autoType = f?.type?.startsWith('video/') ? 'video' : 'article'
                            setLessonForm(p => ({ ...p, file: f, type: f ? autoType : p.type }))
                          }} />
                        {lessonForm.file && <p className='mt-1.5 text-xs text-emerald-600'>✓ {lessonForm.file.name}</p>}
                        {lessonForm.type === 'video' && localPreviewUrl && (
                          <video src={localPreviewUrl} controls className='mt-3 w-full max-h-48 rounded-xl bg-black' />
                        )}
                      </div>
                    </div>
                    {creatingLesson && (
                      <div className='mt-4'>
                        <div className='flex justify-between text-xs text-slate-500 mb-1'><span>Uploading…</span><span>{uploadPercent}%</span></div>
                        <div className='h-2 w-full overflow-hidden rounded-full bg-slate-200'>
                          <motion.div className='h-full rounded-full bg-indigo-500' initial={{ width: 0 }} animate={{ width: `${uploadPercent}%` }} />
                        </div>
                      </div>
                    )}
                    <div className='mt-4 flex gap-3'>
                      <motion.button whileTap={{ scale: 0.97 }} type='submit' disabled={creatingLesson}
                        className='rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60'>
                        {creatingLesson ? `Uploading ${uploadPercent}%` : 'Add Lesson'}
                      </motion.button>
                      <button type='button' onClick={() => setShowAddLesson(false)}
                        className='rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50'>Cancel</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Add buttons */}
              {!showAddLesson && (
                <div className='flex gap-3'>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAddLesson(true)}
                    className='flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600'>
                    <PlusIcon /> Add Lesson
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAddQuiz(true)}
                    className='flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 py-3 text-sm font-medium text-amber-600 hover:border-amber-400'>
                    <PlusIcon /> Add Quiz
                  </motion.button>
                </div>
              )}

              {/* Quiz form */}
              {showAddQuiz && (
                <InstructorQuizCreationForm
                  courseId={courseId}
                  moduleId={selectedModuleId}
                  defaultOrderIndex={nextLessonOrderIndex}
                  onCreated={async () => { setShowAddQuiz(false); await refetchLessons() }}
                  onCancel={() => setShowAddQuiz(false)}
                />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstructorCourseDetails