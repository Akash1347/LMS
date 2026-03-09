import React from 'react'
import { useCourseStore } from '@/Store/user.store'
import { useNavigate } from 'react-router-dom'

const InstructorCourse = () => {
  const navigate = useNavigate()
  const createdCourses = useCourseStore((state) => state.createdCourses)

  const formatPrice = (price, currency = 'INR') => {
    if (price === null || price === undefined) return 'Free'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(price))
  }

  return (
    <section className='min-h-screen bg-slate-50 px-4 py-8 sm:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-slate-900 sm:text-3xl'>Created Courses</h1>
            <p className='mt-1 text-sm text-slate-600'>Manage and review courses you have created.</p>
          </div>
          <button
            type='button'
            onClick={() => navigate('/instructor-course/create')}
            className='rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800'
          >
            Add Course
          </button>
        </div>

        {!Array.isArray(createdCourses) || createdCourses.length === 0 ? (
          <div className='rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600'>
            You have not created any courses yet.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {createdCourses.map((course) => (
              <article
                key={course?.id}
                className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
              >
                <div className='mb-3 flex items-start justify-between gap-3'>
                  <h2 className='line-clamp-2 text-lg font-semibold text-slate-900'>
                    {course?.title || 'Untitled course'}
                  </h2>
                  <span className='rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700'>
                    {course?.level || 'N/A'}
                  </span>
                </div>

                <p className='mb-4 line-clamp-3 text-sm text-slate-600'>
                  {course?.description || 'No description added for this course yet.'}
                </p>

                <div className='mb-4 space-y-1 text-sm text-slate-700'>
                  <p><span className='font-medium'>Category:</span> {course?.category || 'General'}</p>
                  <p><span className='font-medium'>Language:</span> {course?.language || 'English'}</p>
                  <p><span className='font-medium'>Price:</span> {formatPrice(course?.price, course?.currency || 'INR')}</p>
                </div>

                <button
                  onClick={() => navigate(`/course/${course?.id}`)}
                  disabled={!course?.id}
                  className='w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  View Course
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default InstructorCourse