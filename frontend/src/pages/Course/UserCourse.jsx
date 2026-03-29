import React, { useEffect } from 'react'
import { useCourseStore } from '@/Store/user.store'
import { useNavigate } from 'react-router-dom'
import { useGetBulkCourseByIdsHook, useGetUserCourseHook } from '@/hooks/course.hook'
import { motion } from 'framer-motion'

/* ─── Minimal Icons ─────────────────────────────────────────────────── */
const Icons = {
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Layer: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
  Book: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  ArrowRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
}

/* ─── Animations ────────────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1]
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } }
}

const UserCourse = () => {
  const navigate = useNavigate()
  const enrolledCourses = useCourseStore((state) => state.enrolledCourses)
  const setEnrolledCourses = useCourseStore((state) => state.setEnrolledCourses)
  
  const { data: userCourseData, isSuccess: userCourseSuccess } = useGetUserCourseHook()
  
  useEffect(() => {
    if (userCourseSuccess && userCourseData?.data) {
      setEnrolledCourses(userCourseData.data)
    }
  }, [userCourseSuccess, userCourseData, setEnrolledCourses])

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
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
  }

  return (
    <section className='min-h-screen bg-[#FAFAFA] px-6 py-16 selection:bg-zinc-200 md:py-24 font-sans'>
      <div className='mx-auto max-w-6xl'>
        
        {/* ─── Header ─── */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className='mb-12 border-b border-zinc-200/60 pb-8'
        >
          <h1 className='text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl'>My Learning</h1>
          <p className='mt-2.5 text-base text-zinc-500'>Pick up right where you left off and track your progress.</p>
        </motion.div>

        {/* ─── Empty State ─── */}
        {!Array.isArray(enrolledCourses) || enrolledCourses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease }}
            className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 p-16 text-center'
          >
            <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-zinc-400 shadow-sm border border-zinc-100'>
               <Icons.Book />
            </div>
            <h3 className='text-xl font-semibold tracking-tight text-zinc-900'>No courses yet</h3>
            <p className='mt-2 max-w-sm text-sm leading-relaxed text-zinc-500'>
              Your learning journey hasn't started. Browse the catalog to find a course that fits your goals.
            </p>
            <button 
              onClick={() => navigate('/home#courses')}
              className='mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95 shadow-sm'
            >
              Explore Catalog <Icons.ArrowRight />
            </button>
          </motion.div>
        ) : (
          
          /* ─── Course Grid ─── */
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
              const isActive = status === 'active'

              return (
                <motion.article
                  variants={cardVariants}
                  key={item?.course_id || course?.id}
                  className='group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 transition-all duration-300 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                >
                  <div>
                    {/* Status Badge */}
                    <div className='mb-5 flex items-start justify-between gap-4'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          isActive 
                            ? 'bg-zinc-100 text-zinc-900' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        }`}
                      >
                        {isActive ? 'In Progress' : 'Pending Payment'}
                      </span>
                    </div>

                    {/* Course Info */}
                    <h2 className='mb-3 line-clamp-2 text-lg font-bold leading-tight tracking-tight text-zinc-900'>
                      {course?.title || 'Course details loading...'}
                    </h2>
                    
                    <p className='mb-6 line-clamp-2 text-sm leading-relaxed text-zinc-500'>
                      {course?.description || 'Learn the fundamental concepts and build a strong foundation.'}
                    </p>

                    {/* Meta Data */}
                    <div className='mb-6 space-y-3'>
                      <div className='flex items-center gap-3 text-sm text-zinc-500'>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100"><Icons.Calendar /></span>
                        <span>Enrolled {formatDate(item?.enrolled_at)}</span>
                      </div>
                      <div className='flex items-center gap-3 text-sm text-zinc-500'>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100"><Icons.Layer /></span>
                        <span className='capitalize'>{course?.level || 'Beginner'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions & Progress */}
                  <div className='pt-4 border-t border-zinc-100'>
                    {isActive && (
                      <div className="mb-4">
                        <div className="mb-1.5 flex justify-between text-xs font-medium text-zinc-500">
                          <span>Progress</span>
                          <span>0%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full w-0 rounded-full bg-zinc-900 transition-all duration-500 group-hover:w-[15%]" />
                        </div>
                      </div>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!isActive) {
                          navigate(`/payment/${courseId}`)
                          return
                        }
                        navigate(`/course-page/${courseId}`)
                      }}
                      disabled={!courseId}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                        !isActive 
                        ? 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' 
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm hover:shadow'
                      }`}
                    >
                      {!isActive ? 'Complete Payment' : 'Continue Learning'}
                      {isActive && <Icons.ArrowRight />}
                    </motion.button>
                  </div>
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