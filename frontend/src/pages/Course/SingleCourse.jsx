import React, { useState, useEffect } from 'react'
import { useGetCourseDetailsHook } from '@/hooks/course.hook'

const SingleCourse = () => {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const { data, isLoading, error } = useGetCourseDetailsHook(window.location.pathname.split('/')[2])

  useEffect(() => {
    if (data) {
      setCourse(data)
      setLoading(false)
    }
  }, [data])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <section className='min-h-screen bg-slate-50 px-4 py-8 sm:px-8'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-slate-900'>Course Details</h1>
          <button
            type='button'
            onClick={() => window.history.back()}
            className='rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100'
          >
            Back
          </button>
        </div>

        {course && (
          <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
            {/* Course Image */}
            <div className='mb-4'>
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title || 'Course thumbnail'}
                  className='w-full h-64 object-cover rounded-lg mb-4'
                />
              ) : (
                <div className='w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center'>
                  <div className='text-slate-400 text-sm'>No image available</div>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className='mb-6'>
              <h2 className='text-xl font-bold text-slate-900 mb-2'>{course.title || 'Untitled Course'}</h2>
              <p className='text-sm text-slate-600 mb-4'>{course.description || 'No description available'}</p>

              {/* Categories */}
              {course.category && course.category.length > 0 && (
                <div className='mb-4'>
                  <h3 className='text-sm font-medium text-slate-700 mb-1'>Categories:</h3>
                  <div className='flex flex-wrap gap-2'>
                    {course.category.map((cat, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800'
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Info */}
              <div className='grid grid-cols-2 gap-4 text-sm text-slate-700'>
                <div>
                  <span className='font-medium'>Level:</span> {course.level || 'N/A'}
                </div>
                <div>
                  <span className='font-medium'>Language:</span> {course.language || 'English'}
                </div>
                <div>
                  <span className='font-medium'>Price:</span> {course.price || 0} {course.currency || 'USD'}
                </div>
                <div>
                  <span className='font-medium'>Status:</span> {course.status || 'draft'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-3'>
              <button className='flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800'>
                Enroll Now
              </button>
              <button className='flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100'>
                Preview Course
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default SingleCourse
