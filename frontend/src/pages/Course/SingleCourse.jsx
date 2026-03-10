import React from 'react'
import { useGetCourseDetailsHook, useGetCourseEnrollmentAnalyticsHook, useEnrollInCourseHook } from '@/hooks/course.hook'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const SingleCourse = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, error } = useGetCourseDetailsHook(id)
  const { mutate: enrollInCourse, isPending: enrolling } = useEnrollInCourseHook()
  const { data: analyticsData, isLoading: analyticsLoading } = useGetCourseEnrollmentAnalyticsHook(id)
  
  const courseDetails = data?.data || null
  const course = courseDetails?.course || null
  const modules = Array.isArray(courseDetails?.modules) ? courseDetails.modules : []
  const instructor = courseDetails?.instructor || null
  const purchasedCount = Number(analyticsData?.enrolled_students || 0)

  if (isLoading) return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent'></div>
    </div>
  )
  if (error) return <div className='p-8 text-center text-red-500'>Error: {error.message}</div>
  if (!course) return <div className='p-8 text-center text-slate-500'>Course not found.</div>

  const handleEnrollNow = () => {
    enrollInCourse(id, {
      onSuccess: () => navigate(`/payment/${id}`),
    })
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Hero Banner */}
      <div className='bg-slate-900 py-16 text-white sm:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-8'>
          <button
            onClick={() => window.history.back()}
            className='mb-8 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white'
          >
            &larr; Back to courses
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='max-w-3xl'>
            <div className='mb-4 flex flex-wrap gap-2'>
              {course.category?.map((cat, index) => (
                <span key={index} className='rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30'>
                  {cat}
                </span>
              ))}
            </div>
            <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl'>{course.title || 'Untitled Course'}</h1>
            <p className='mt-4 text-lg leading-relaxed text-slate-300'>{course.description}</p>
            <div className='mt-8 flex items-center gap-6 text-sm text-slate-400'>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500'></div>
                <span>By <strong className='text-white'>{instructor?.name || 'Unknown Instructor'}</strong></span>
              </div>
              <div className='flex items-center gap-2'>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'><path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'/></svg>
                <span>{analyticsLoading ? '...' : purchasedCount} Enrolled</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-8'>
        <div className='flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12'>
          
          {/* Main Content Area */}
          <div className='flex-1 space-y-10'>
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className='text-2xl font-bold text-slate-900'>What you'll learn</h2>
              <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                <h3 className='mb-4 font-semibold text-slate-900'>Course Modules ({modules.length})</h3>
                {modules.length === 0 ? (
                  <p className='text-slate-500'>No modules added yet.</p>
                ) : (
                  <div className='space-y-3'>
                    {modules.map((moduleItem, idx) => (
                      <div key={moduleItem.id} className='flex items-center gap-4 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100'>
                        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700'>
                          {idx + 1}
                        </div>
                        <span className='font-medium text-slate-700'>{moduleItem.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* Sticky Sidebar / Enrollment Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className='lg:sticky lg:top-8 w-full lg:w-[400px] shrink-0'
          >
            <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className='h-56 w-full object-cover' />
              ) : (
                <div className='flex h-56 w-full items-center justify-center bg-slate-100'>
                  <span className='text-slate-400 text-sm font-medium'>Course Preview</span>
                </div>
              )}
              
              <div className='p-8'>
                <div className='mb-6 flex items-end gap-2'>
                  <span className='text-4xl font-extrabold text-slate-900'>
                    {course.price === 0 ? 'Free' : course.price}
                  </span>
                  {course.price > 0 && <span className='text-lg font-medium text-slate-500 mb-1'>{course.currency || 'USD'}</span>}
                </div>

                <div className='space-y-4'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnrollNow}
                    disabled={enrolling}
                    className='w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-70'
                  >
                    {enrolling ? 'Processing...' : 'Enroll Now'}
                  </motion.button>
                  <button className='w-full rounded-xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 hover:bg-slate-50'>
                    Preview Course
                  </button>
                </div>

                <ul className='mt-8 space-y-4 text-sm text-slate-600'>
                  <li className='flex items-center gap-3'>
                    <svg className='h-5 w-5 text-indigo-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z'/></svg>
                    <span>{course.level || 'All levels'}</span>
                  </li>
                  <li className='flex items-center gap-3'>
                    <svg className='h-5 w-5 text-indigo-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129'/></svg>
                    <span>{course.language || 'English'}</span>
                  </li>
                  <li className='flex items-center gap-3'>
                    <svg className='h-5 w-5 text-indigo-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'/></svg>
                    <span>Full lifetime access</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SingleCourse