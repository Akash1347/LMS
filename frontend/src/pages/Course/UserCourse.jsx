import React from 'react'
import { useCourseStore } from '@/Store/user.store'
import { useNavigate } from 'react-router-dom'
import { useGetBulkCourseByIdsHook } from '@/hooks/course.hook'

const UserCourse = () => {
  const navigate = useNavigate()
  const enrolledCourses = useCourseStore((state) => state.enrolledCourses)

  const enrolledCourseIds = Array.isArray(enrolledCourses)
    ? enrolledCourses.map((item) => item?.course_id).filter(Boolean)
    : []

  const { data: bulkCoursesData } = useGetBulkCourseByIdsHook(
    enrolledCourseIds,
    enrolledCourseIds.length > 0
  )

  const detailedCourses = Array.isArray(bulkCoursesData?.data) ? bulkCoursesData.data : []
  const detailedById = new Map(detailedCourses.map((course) => [String(course?.id), course]))

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <section className='min-h-screen bg-slate-50 px-4 py-8 sm:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-slate-900 sm:text-3xl'>My Courses</h1>
          <p className='mt-1 text-sm text-slate-600'>Track your enrolled courses and continue learning.</p>
        </div>

        {!Array.isArray(enrolledCourses) || enrolledCourses.length === 0 ? (
          <div className='rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600'>
            You are not enrolled in any course yet.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {enrolledCourses.map((item) => {
              const course = detailedById.get(String(item?.course_id)) || {}
              const courseId = item?.course_id
              const status = item?.status || 'pending'

              return (
                <article
                  key={item?.course_id || course?.id}
                  className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
                >
                  <div className='mb-3 flex items-start justify-between gap-3'>
                    <h2 className='line-clamp-2 text-lg font-semibold text-slate-900'>
                      {course?.title || 'Course details unavailable'}
                    </h2>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                      {status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </div>

                  <p className='mb-4 line-clamp-3 text-sm text-slate-600'>
                    {course?.description || 'Course description will appear once details are available.'}
                  </p>

                  <div className='mb-4 space-y-1 text-sm text-slate-700'>
                    <p><span className='font-medium'>Enrolled on:</span> {formatDate(item?.enrolled_at)}</p>
                    <p><span className='font-medium'>Level:</span> {course?.level || 'N/A'}</p>
                  </div>

                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    disabled={!courseId}
                    className='w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    View Course
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default UserCourse