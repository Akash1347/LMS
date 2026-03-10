import React from 'react'
import { useCourseStore } from '@/Store/user.store'
import { useNavigate } from 'react-router-dom'
import { useGetBulkCourseByIdsHook } from '@/hooks/course.hook'
import { motion } from 'framer-motion'

/* ─── Minimal Icons ─────────────────────────────────────────────────── */
const Icons = {
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Layer: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
  Book: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
}

/* ─── Animations ────────────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1]
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } }
}

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
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <section className='min-h-screen bg-[#FAFAFA] px-6 py-16 selection:bg-zinc-200 md:py-24'>
      <div className='mx-auto max-w-6xl'>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className='mb-12'
        >
          <h1 className='text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl'>My Learning</h1>
          <p className='mt-2 text-base text-zinc-500'>Pick up right where you left off and track your progress.</p>
        </motion.div>

        {/* Empty State */}
        {!Array.isArray(enrolledCourses) || enrolledCourses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease }}
            className='flex flex-col items-center justify-center rounded-3xl border border-zinc-200/60 bg-white p-16 text-center shadow-sm'
          >
            <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400'>
               <Icons.Book />
            </div>
            <h3 className='text-lg font-semibold text-zinc-900'>No courses yet</h3>
            <p className='mt-2 max-w-sm text-sm leading-relaxed text-zinc-500'>
              You are not enrolled in any courses at the moment. Browse our catalog to start learning.
            </p>
            <button 
              onClick={() => navigate('/home#courses')}
              className='mt-6 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800'
            >
              Explore Courses
            </button>
          </motion.div>
        ) : (
          /* Course Grid */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          >
            {enrolledCourses.map((item) => {
              const course = detailedById.get(String(item?.course_id)) || {}
              const courseId = item?.course_id
              const status = item?.status || 'pending'

              return (
                <motion.article
                  variants={cardVariants}
                  key={item?.course_id || course?.id}
                  className='group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-md'
                >
                  <div>
                    <div className='mb-4 flex items-start justify-between gap-4'>
                      <span
                        className={`inline-flex items-center rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          status === 'active' ? 'text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        {status === 'active' ? 'Active' : 'Pending Payment'}
                      </span>
                    </div>

                    <h2 className='mb-2 line-clamp-2 text-lg font-bold leading-tight tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-600'>
                      {course?.title || 'Course details unavailable'}
                    </h2>
                    
                    <p className='mb-6 line-clamp-2 text-sm leading-relaxed text-zinc-500'>
                      {course?.description || 'Course description will appear once details are available.'}
                    </p>

                    <div className='mb-6 space-y-2.5'>
                      <div className='flex items-center gap-2.5 text-sm text-zinc-500'>
                        <Icons.Calendar />
                        <span>Enrolled {formatDate(item?.enrolled_at)}</span>
                      </div>
                      <div className='flex items-center gap-2.5 text-sm text-zinc-500'>
                        <Icons.Layer />
                        <span className='capitalize'>{course?.level || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (status === 'pending') {
                        navigate(`/payment/${courseId}`)
                        return
                      }
                      navigate(`/course-page/${courseId}`)
                    }}
                    disabled={!courseId}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      status === 'pending' 
                      ? 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50' 
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
                    }`}
                  >
                    {status === 'pending' ? 'Finish Payment' : 'Continue Learning'}
                  </motion.button>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default UserCourse