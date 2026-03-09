import React, { useEffect } from 'react'
import { useAuthStore, useCourseStore } from '@/Store/user.store'
const Home = () => {
  const { userData } = useAuthStore();
  const { enrolledCourses, createdCourses, role } = useCourseStore();
useEffect(() => {
  if (userData && userData.role === 'Student') {
    enrolledCourses();
  } else if (userData) {
    createdCourses();
  }
}, [userData, enrolledCourses, createdCourses])
  return (
    <div>Home</div>
  )
}

export default Home