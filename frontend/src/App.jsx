import React, { useEffect } from 'react'
import MainRoutes from './Routes/MainRoutes'
import Navbar from './ui/Navbar'
import Footer from './ui/Footer'
import CourseAIChat from './ui/CourseAIChat'
import { useLocation } from 'react-router-dom'
import { useGetUserDataHook } from './hooks/user.hook'
import { useAuthStore, useCourseStore } from './Store/user.store'

const normalizeUser = (payload) => {
  const user = payload?.userData || payload?.user || payload?.data?.user || payload?.data || null
  if (!user) return null

  return {
    id: user.user_id || user.id,
    name: user.user_name || user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }
}

const App = () => {
  const location = useLocation()
  const hiddenRoute = ['/login', '/register']
  const shouldHideNavbar = hiddenRoute.some((route) => location.pathname.startsWith(route))
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  
  const login = useAuthStore((state) => state.login)
  const setEnrolledCourses = useCourseStore((state) => state.setEnrolledCourses)
  const setCreatedCourses = useCourseStore((state) => state.setCreatedCourses)
  const setRole = useCourseStore((state) => state.setRole)
  
  const { data: userData, isSuccess } = useGetUserDataHook()

  useEffect(() => {
    if (isSuccess && userData) {
      const user = normalizeUser(userData)
      if (!user) return
      login(user)
      setRole(user.role)
      
      // Set courses based on role
      if (user.role === 'student' && user.enrolledCourses) {
        setEnrolledCourses(user.enrolledCourses)
      } else if (user.role === 'instructor' && user.createdCourses) {
        setCreatedCourses(user.createdCourses)
      }
    }
  }, [isSuccess, userData, login, setRole, setEnrolledCourses, setCreatedCourses])

  return (
    <div>
      {!shouldHideNavbar && <Navbar />}

      <MainRoutes />
      {isLoggedIn && <CourseAIChat />}
      <Footer />
    </div>
  )
}

export default App
