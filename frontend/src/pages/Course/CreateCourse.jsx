import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateCourseHook } from '@/hooks/course.hook'
import { useCourseStore } from '@/Store/user.store'
import { toast } from 'sonner'

const initialForm = {
  title: '',
  description: '',
  categories: [],               // 👈 now a tag‑input array (replaces multi‑select)
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
  const [categoryInput, setCategoryInput] = useState('') // current category being typed

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

  // ---- Categories tag handlers ----
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
  // ---------------------------------

  const handleSubmit = (e) => {
    e.preventDefault()

const payload = new FormData()
    payload.append('title', formData.title)
    payload.append('description', formData.description)
    payload.append('categories', formData.categories) // 👈 send as array
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
          console.log('Course created successfully:', created)
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
    <section className='min-h-screen bg-slate-50 px-4 py-8 sm:px-8'>
      <div className='mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-slate-900'>Create Course</h1>
          <button
            type='button'
            onClick={() => navigate('/instructor-course')}
            className='rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100'
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Title */}
          <div className='md:col-span-2'>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Title *</label>
            <input
              name='title'
              required
              value={formData.title}
              onChange={handleChange}
              className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
            />
          </div>

          {/* Description */}
          <div className='md:col-span-2'>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Description *</label>
            <textarea
              name='description'
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
            />
          </div>

          {/* Categories - Tag Input (replaces multi‑select) */}
          <div className='md:col-span-2'>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Categories *</label>
            <div className='flex gap-2 mb-2'>
              <input
                type='text'
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleCategoryKeyDown}
                placeholder='e.g. Programming, Design, Business'
                className='flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm'
              />
              <button
                type='button'
                onClick={handleAddCategory}
                className='rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900'
              >
                Add
              </button>
            </div>
            {/* Display categories as tags */}
            <div className='flex flex-wrap gap-2'>
              {formData.categories.map((cat, index) => (
                <span
                  key={index}
                  className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800'
                >
                  {cat}
                  <button
                    type='button'
                    onClick={() => handleRemoveCategory(index)}
                    className='ml-1 text-slate-500 hover:text-red-600 font-bold'
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <p className='mt-1 text-xs text-slate-500'>
              Type a category and press Enter or click Add. (At least one required)
            </p>
          </div>

          {/* Language */}
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Language *</label>
            <input
              name='language'
              required
              value={formData.language}
              onChange={handleChange}
              className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
            />
          </div>

          {/* Level */}
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Level *</label>
            <select
              name='level'
              required
              value={formData.level}
              onChange={handleChange}
              className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
            >
              <option value='beginner'>Beginner</option>
              <option value='intermediate'>Intermediate</option>
              <option value='advanced'>Advanced</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Status *</label>
            <select
              name='status'
              required
              value={formData.status}
              onChange={handleChange}
              className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
            >
              <option value='draft'>Draft</option>
              <option value='published'>Published</option>
              <option value='archived'>Archived</option>
            </select>
          </div>

          {/* Price & Currency */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Price *</label>
              <input
                type='number'
                required
                min='0'
                name='price'
                value={formData.price}
                onChange={handleChange}
                className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Currency *</label>
              <input
                name='currency'
                required
                maxLength={3}
                value={formData.currency}
                onChange={handleChange}
                className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase'
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div className='md:col-span-2'>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Course Thumbnail (File)</label>
            <input
              type='file'
              name='file'
              accept='image/*'
              onChange={handleChange}
              className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white'
            />
            <p className='mt-1 text-xs text-slate-500'>
              If no file is uploaded, backend default image will be used.
            </p>
          </div>

          {/* Submit */}
          <div className='md:col-span-2 mt-2 flex justify-end'>
            <button
              type='submit'
              disabled={isPending}
              className='rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60'
            >
              {isPending ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CreateCourse