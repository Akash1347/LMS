import React from 'react'

const AboutSection = () => {
  return (
    <main className='min-h-[88vh] bg-slate-50 px-6 py-12 text-slate-800 md:px-12'>
      <section className='mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2'>
        <div className='space-y-6'>
          <span className='inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
            Welcome to EduSmart
          </span>

          <h1 className='text-3xl font-bold leading-tight md:text-5xl'>
            Learn smarter with a clean, friendly learning platform
          </h1>

          <p className='max-w-xl text-base leading-7 text-slate-600 md:text-lg'>
            EduSmart is an easy-to-use LMS where students can explore courses, track progress, and take quizzes,
            while instructors can create and manage high-quality learning content — all in one place.
          </p>

          <div className='flex flex-wrap gap-3'>
            <a
              href='/login'
              className='rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700'
            >
              Get Started
            </a>
            <a
              href='/register'
              className='rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
            >
              Create Account
            </a>
          </div>
        </div>

        <div className='relative'>
          <div className='floating-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-3 text-lg font-semibold text-slate-800'>Why learners choose EduSmart</h2>
            <ul className='space-y-3 text-sm text-slate-600'>
              <li className='flex items-start gap-2'>
                <span className='mt-1 h-2 w-2 rounded-full bg-blue-500' />
                Structured courses with clear modules and lessons.
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-1 h-2 w-2 rounded-full bg-blue-500' />
                Interactive quizzes to check understanding.
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-1 h-2 w-2 rounded-full bg-blue-500' />
                Instructor and student dashboards for focused workflows.
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-1 h-2 w-2 rounded-full bg-blue-500' />
                Minimal interface designed for distraction-free learning.
              </li>
            </ul>
          </div>

          <div className='pulse-circle absolute -left-4 -top-4 h-20 w-20 rounded-full bg-blue-100/70' />
          <div className='pulse-circle absolute -bottom-5 -right-2 h-16 w-16 rounded-full bg-indigo-100/70' />
        </div>
      </section>

      <section className='mx-auto mt-14 grid w-full max-w-6xl gap-4 sm:grid-cols-3'>
        <article className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
          <h3 className='mb-2 text-base font-semibold'>For Students</h3>
          <p className='text-sm text-slate-600'>
            Discover courses, track your enrolled content, and improve skills with simple step-by-step learning.
          </p>
        </article>

        <article className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
          <h3 className='mb-2 text-base font-semibold'>For Instructors</h3>
          <p className='text-sm text-slate-600'>
            Build and publish courses, manage lessons, and assess learners with built-in quiz tools.
          </p>
        </article>

        <article className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
          <h3 className='mb-2 text-base font-semibold'>Simple Experience</h3>
          <p className='text-sm text-slate-600'>
            A clean, minimal interface with smooth animations that feels friendly for everyday learning.
          </p>
        </article>
      </section>

      <style>{`
        .floating-card {
          animation: floatY 5s ease-in-out infinite;
        }

        .pulse-circle {
          animation: pulseSoft 3.2s ease-in-out infinite;
        }

        @keyframes floatY {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulseSoft {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
    </main>
  )
}

export default AboutSection