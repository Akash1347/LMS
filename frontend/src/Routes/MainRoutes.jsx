import Home from '../pages/User/Home'
import LogIn from '../pages/Auth/LogIn'
import Register from '../pages/Auth/Register'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectecRoutes } from './ProtectedRoutes'
import CourseSection from '../ui/CourseSection'
import SingleCourse from '@/pages/Course/SingleCourse'
import UserCourse from '@/pages/Course/UserCourse'
import InstructorCourse from '@/pages/Course/InstructorCourse'
import CreateCourse from '@/pages/Course/CreateCourse'
import AboutSection from '@/ui/AboutSection'
import Payment from '@/pages/Payment/Payment'
import CoursePage from '@/pages/Course/CoursePage'
import QuizPage from '@/pages/Course/QuizPage'
import QuizLeaderboardPage from '@/pages/Course/QuizLeaderboardPage'
import QuizStatisticsPage from '@/pages/Course/QuizStatisticsPage'
import InstructorCourseDetails from '@/pages/Course/InstructorCourseDetails'
import HomePage from '@/pages/home/HomePage'
import Dashboard from '@/pages/home/Dashboard'

const MainRoutes = () => {
  return (
    <Routes>
      
      <Route path='/' element={<AboutSection />} />
      <Route path='/home' element={
        <ProtectecRoutes>
          <HomePage />
        </ProtectecRoutes>
      } />
      <Route path='/dashboard' element= {<Dashboard/>} />
      <Route path='/login' element={<LogIn />} />
      <Route path='/register' element={<Register />} />
      <Route path='/course' element={<CourseSection />} />
      <Route path='/course/:id' element={<SingleCourse />} />

      <Route path='/user-course' element={
        <ProtectecRoutes allowedRoles={['student']}>
          <UserCourse />
        </ProtectecRoutes>
      } />
      <Route path='/payment/:courseId' element={
        <ProtectecRoutes allowedRoles={['student']}>
          <Payment />
        </ProtectecRoutes>
      } />
      <Route path='/course-page/:courseId' element={
        <ProtectecRoutes allowedRoles={['student']}>
          <CoursePage />
        </ProtectecRoutes>
      } />
      <Route path='/course-page/:courseId/quiz/:quizId' element={
        <ProtectecRoutes allowedRoles={['student']}>
          <QuizPage />
        </ProtectecRoutes>
      } />
      <Route path='/course-page/:courseId/quiz/:quizId/leaderboard' element={
        <ProtectecRoutes allowedRoles={['student']}>
          <QuizLeaderboardPage />
        </ProtectecRoutes>
      } />
      <Route path='/course-page/:courseId/quiz/:quizId/statistics' element={
        <ProtectecRoutes allowedRoles={['student']}>
          <QuizStatisticsPage />
        </ProtectecRoutes>
      } />
      <Route path='/instructor-course' element={
        <ProtectecRoutes allowedRoles={['instructor']}>
          <InstructorCourse />
        </ProtectecRoutes>
      } />
      <Route path='/instructor-course/create' element={
        <ProtectecRoutes allowedRoles={['instructor']}>
          <CreateCourse />
        </ProtectecRoutes>
      } />
      <Route path='/instructor-course/course/:courseId' element={
        <ProtectecRoutes allowedRoles={['instructor']}>
          <InstructorCourseDetails />
        </ProtectecRoutes>
      } />

    </Routes>
  )
}

export default MainRoutes