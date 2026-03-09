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

const MainRoutes = () => {
  return (
    <Routes>
      
      <Route path='/' element={<AboutSection />} />
      <Route path='/home' element={
        <ProtectecRoutes>
          <Home />
        </ProtectecRoutes>
      } />

      <Route path='/login' element={<LogIn />} />
      <Route path='/register' element={<Register />} />
      <Route path='/course' element={<CourseSection />} />
      <Route path='/course/:id' element={<SingleCourse />} />
      <Route path='/user-course' element={
        <ProtectecRoutes allowedRoles={['student']}>
          <UserCourse />
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

    </Routes>
  )
}

export default MainRoutes