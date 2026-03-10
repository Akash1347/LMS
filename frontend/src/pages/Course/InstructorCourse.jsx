import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateCourseHook } from '@/hooks/course.hook'
import { useCourseStore } from '@/Store/user.store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Minimal Icons ─────────────────────────────────────────────────── */
const Icons = {
  Back: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Image: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
}

/* ─── Reusable Field Component ──────────────────────────────────────── */
const Field = ({ label, required, children, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className='text-[11px] font-bold uppercase tracking-widest text-zinc-500'>
      {label} {required && <span className="text-zinc-900">*</span>}
    </label>
    {children}
  </div>
)

const initialForm = {
  title: '',
  description: '',
  categories: [],
  level: 'beginner',
  status: 'draft',
  language: 'english',
  price: '0',
  currency: 'INR',
  file: null,
}

const CreateCourse = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialForm)
  const [categoryInput, setCategoryInput] = useState('') 

  const { mutate: createCourse, isPending } = useCreateCourseHook()
  const createdCourses = useCourseStore((state) => state.createdCourses)
  const setCreatedCourses = useCourseStore((state) => state.setCreatedCourses)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'file') {
      setFormData((prev) => ({ ...prev, file: files?.[0] || null }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* ─── Category Handlers ─── */
  const handleAddCategory = (e) => {
    e.preventDefault()
    const trimmed = categoryInput.trim()
    if (trimmed && !formData.categories.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, trimmed]
      }))
      setCategoryInput('')
    }
  }

  const handleRemoveCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }))
  }

  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCategory(e)
    }
  }

  /* ─── Submit Handler ─── */
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.categories.length === 0) {
      toast.error("Please add at least one category")
      return
    }

    const payload = new FormData()
    payload.append('title', formData.title)
    payload.append('description', formData.description)
    payload.append('category', formData.categories.join(','))
    payload.append('level', formData.level)
    payload.append('status', formData.status)
    payload.append('language', formData.language)
    payload.append('price', formData.price === '' ? '0' : String(Number(formData.price)))
    payload.append('currency', formData.currency.toUpperCase())

    if (formData.file) {
      payload.append('file', formData.file)
    }

    createCourse(payload, {
      onSuccess: (res) => {
        const created = res?.data?.data
        if (created) {
          setCreatedCourses([created, ...(Array.isArray(createdCourses) ? createdCourses : [])])
          toast.success('Course created successfully')
          navigate(`/instructor-course/course/${created.id}`)
        }
        setFormData(initialForm)
        setCategoryInput('')
      },
      onError: (err) => {
        console.error('Error creating course:', err)
        toast.error('Error creating course. Please try again.')
      },
    })
  }

  return (
    <section className='min-h-screen bg-[#FAFAFA] px-6 py-12 selection:bg-zinc-200 md:py-20'>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className='mx-auto max-w-3xl'
      >
        {/* ── Header ── */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <button
              type='button'
              onClick={() => navigate('/instructor-course')}
              className='mb-4 flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 focus:outline-none'
            >
              <Icons.Back /> Back to Dashboard
            </button>
            <h1 className='text-3xl font-extrabold tracking-tight text-zinc-900'>Create Course</h1>
            <p className='mt-2 text-sm text-zinc-500'>Fill in the details below to initialize your new curriculum.</p>
          </div>
        </div>

        {/* ── Form Card ── */}
        <form onSubmit={handleSubmit} className='rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm md:p-10'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            
            {/* Title */}
            <Field label='Course Title' required className='md:col-span-2'>
              <input
                name='title'
                required
                value={formData.title}
                onChange={handleChange}
                placeholder='e.g., Advanced React Patterns'
                className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100'
              />
            </Field>

            {/* Description */}
            <Field label='Description' required className='md:col-span-2'>
              <textarea
                name='description'
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder='What will students learn in this course?'
                className='w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100'
              />
            </Field>

            {/* Categories (Tag Input) */}
            <Field label='Categories' required className='md:col-span-2'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={handleCategoryKeyDown}
                  placeholder='e.g., Web Development'
                  className='flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100'
                />
                <button
                  type='button'
                  onClick={handleAddCategory}
                  className='rounded-xl bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none'
                >
                  Add
                </button>
              </div>
              
              <div className='mt-3 flex flex-wrap gap-2'>
                <AnimatePresence>
                  {formData.categories.map((cat, index) => (
                    <motion.span
                      key={cat}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700'
                    >
                      {cat}
                      <button
                        type='button'
                        onClick={() => handleRemoveCategory(index)}
                        className='text-zinc-400 transition-colors hover:text-zinc-900'
                      >
                        <Icons.X />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </Field>

            {/* Language */}
            <Field label='Language' required>
              <input
                name='language'
                required
                value={formData.language}
                onChange={handleChange}
                placeholder='e.g., English'
                className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100'
              />
            </Field>

            {/* Level */}
            <Field label='Difficulty Level' required>
              <select
                name='level'
                required
                value={formData.level}
                onChange={handleChange}
                className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100'
              >
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
            </Field>

            {/* Status */}
            <Field label='Initial Status' required>
              <select
                name='status'
                required
                value={formData.status}
                onChange={handleChange}
                className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100'
              >
                <option value='draft'>Draft (Hidden)</option>
                <option value='published'>Published (Public)</option>
              </select>
            </Field>

            {/* Price & Currency */}
            <div className='flex gap-4'>
              <Field label='Price' required className='flex-1'>
                <input
                  type='number'
                  required
                  min='0'
                  name='price'
                  value={formData.price}
                  onChange={handleChange}
                  className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100'
                />
              </Field>
              <Field label='Currency' required className='w-24'>
                <input
                  name='currency'
                  required
                  maxLength={3}
                  value={formData.currency}
                  onChange={handleChange}
                  className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-zinc-900 outline-none transition-all focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100'
                />
              </Field>
            </div>

            {/* Thumbnail Upload */}
            <Field label='Course Thumbnail' className='md:col-span-2'>
              <div className='relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 transition-colors hover:border-zinc-300 hover:bg-zinc-100/50'>
                <div className='mb-3 rounded-full bg-white p-3 text-zinc-400 shadow-sm ring-1 ring-zinc-200'>
                  {formData.file ? <Icons.Image /> : <Icons.Upload />}
                </div>
                <div className='text-center'>
                  <p className='text-sm font-medium text-zinc-900'>
                    {formData.file ? formData.file.name : 'Click to upload thumbnail'}
                  </p>
                  <p className='mt-1 text-xs text-zinc-500'>
                    {formData.file ? 'Click to select a different file' : 'PNG, JPG, WEBP up to 5MB'}
                  </p>
                </div>
                {/* Hidden File Input covering the entire div */}
                <input
                  type='file'
                  name='file'
                  accept='image/*'
                  onChange={handleChange}
                  className='absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none'
                />
              </div>
            </Field>

          </div>

          {/* Submit Actions */}
          <div className='mt-10 flex items-center justify-end gap-3 border-t border-zinc-100 pt-6'>
            <button
              type='button'
              onClick={() => navigate('/instructor-course')}
              className='rounded-xl px-5 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none'
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type='submit'
              disabled={isPending}
              className='rounded-xl bg-zinc-950 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isPending ? 'Creating...' : 'Create Course'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </section>
  )
}

export default CreateCourse