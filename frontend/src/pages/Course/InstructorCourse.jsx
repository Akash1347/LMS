import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/Store/user.store'
import { useGetCourseOfInstructorHook } from '@/hooks/course.hook'
import { motion } from 'framer-motion'

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Book: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Users: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Dollar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
}

const ease = [0.16, 1, 0.3, 1]
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } }
}

const statusColors = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-amber-100 text-amber-700'
}

const InstructorCourse = () => {
  const navigate = useNavigate()
  const createdCourses = useCourseStore((state) => state.createdCourses)
  const setCreatedCourses = useCourseStore((state) => state.setCreatedCourses)
  
  const { data: instructorCourseData, isSuccess: instructorCourseSuccess } = useGetCourseOfInstructorHook()
  
  useEffect(() => {
    if (instructorCourseSuccess && instructorCourseData?.data) {
      setCreatedCourses(instructorCourseData.data)
    }
  }, [instructorCourseSuccess, instructorCourseData, setCreatedCourses])

  return (
    <section className='min-h-screen bg-[#FAFAFA] px-6 py-16 selection:bg-zinc-200 md:py-24 font-sans'>
      <div className='mx-auto max-w-6xl'>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className='mb-12 border-b border-zinc-200/60 pb-8'
        >
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl'>My Courses</h1>
              <p className='mt-2.5 text-base text-zinc-500'>Manage and track your created courses.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/instructor-course/create')}
              className='inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800'
            >
              <Icons.Plus /> Create Course
            </motion.button>
          </div>
        </motion.div>

        {/* Empty State */}
        {!Array.isArray(createdCourses) || createdCourses.length === 0 ? (
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
              Start creating your first course and share your knowledge with students worldwide.
            </p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/instructor-course/create')}
              className='mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm'
            >
              <Icons.Plus /> Create Your First Course
            </motion.button>
          </motion.div>
        ) : (
          
          /* Course Grid */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          >
            {createdCourses.map((course) => {
              const courseId = course?.id
              const status = course?.status || 'draft'
              const isPublished = status === 'published'

              return (
                <motion.article
                  variants={cardVariants}
                  key={courseId}
                  className='group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 transition-all duration-300 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                >
                  <div>
                    {/* Status Badge */}
                    <div className='mb-5 flex items-start justify-between gap-4'>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusColors[status] || statusColors.draft}`}>
                        {status}
                      </span>
                      <span className='text-xs text-zinc-400'>
                        {course?.level || 'Beginner'}
                      </span>
                    </div>

                    {/* Course Info */}
                    <h2 className='mb-3 line-clamp-2 text-lg font-bold leading-tight tracking-tight text-zinc-900'>
                      {course?.title || 'Untitled Course'}
                    </h2>
                    
                    <p className='mb-6 line-clamp-2 text-sm leading-relaxed text-zinc-500'>
                      {course?.description || 'No description provided.'}
                    </p>

                    {/* Meta Data */}
                    <div className='mb-6 space-y-3'>
                      <div className='flex items-center gap-3 text-sm text-zinc-500'>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100"><Icons.Users /></span>
                        <span>{course?.enrolledCount || 0} students enrolled</span>
                      </div>
                      <div className='flex items-center gap-3 text-sm text-zinc-500'>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100"><Icons.Dollar /></span>
                        <span>{course?.currency || 'INR'} {course?.price || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className='pt-4 border-t border-zinc-100'>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/instructor-course/course/${courseId}`)}
                      disabled={!courseId}
                      className='w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 shadow-sm hover:shadow focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      <Icons.Edit /> Manage Course
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

export default InstructorCourse