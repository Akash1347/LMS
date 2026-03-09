import { useGetUserDataHook } from "@/hooks/user.hook"
import { useGetCourseOfInstructorHook, useGetUserCourseHook } from "@/hooks/course.hook"
import { useAuthStore, useCourseStore } from "@/Store/user.store"
import { useEffect } from "react"
import { Navigate } from "react-router-dom"


export const ProtectecRoutes = ({ children, allowedRoles = [] }) => {
    const authUser = useAuthStore((state) => state.user)
    const login = useAuthStore((state) => state.login)
    const logout = useAuthStore((state) => state.logout)
    const setRole = useCourseStore((state) => state.setRole)
    const setEnrolledCourses = useCourseStore((state) => state.setEnrolledCourses)
    const setCreatedCourses = useCourseStore((state) => state.setCreatedCourses)
    const clearCourses = useCourseStore((state) => state.clearCourses)
    const { data, isLoading, isError } = useGetUserDataHook()
    const role = String(data?.userData?.role || "").toLowerCase()
    const normalizedAllowedRoles = Array.isArray(allowedRoles)
        ? allowedRoles.map((item) => String(item).toLowerCase())
        : []

    const { data: studentCoursesData } = useGetUserCourseHook(Boolean(data?.userData) && role === "student")
    const { data: instructorCoursesData } = useGetCourseOfInstructorHook(Boolean(data?.userData) && role !== "student")

    const studentEnrollments = Array.isArray(studentCoursesData?.data)
        ? studentCoursesData.data
        : []

    useEffect(() => {
        if (data?.userData) {
            const incomingUser = data.userData
            if (!authUser || authUser?.id !== incomingUser?.id) {
                login(incomingUser)
            }
            setRole(incomingUser?.role || null)
        }
        if (isError) {
            logout()
            clearCourses()
        }
    }, [data, isError, login, logout, authUser, setRole, clearCourses])

    useEffect(() => {
        if (!data?.userData) return

        if (role === "student") {
            const lightweightEnrollments = studentEnrollments.map((enrollment) => ({
                course_id: enrollment?.course_id,
                status: enrollment?.status,
                enrolled_at: enrollment?.enrolled_at,
            }))

            setEnrolledCourses(lightweightEnrollments)
            setCreatedCourses([])
            return
        }

        const instructorCourses = Array.isArray(instructorCoursesData)
            ? instructorCoursesData
            : (instructorCoursesData?.data || [])

        setCreatedCourses(instructorCourses)
        setEnrolledCourses([])
    }, [
        data,
        role,
        studentEnrollments,
        instructorCoursesData,
        setEnrolledCourses,
        setCreatedCourses,
    ])

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!data?.userData) {
        return <Navigate to={'/login'} replace />
    }

    if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(role)) {
        return <Navigate to={'/'} replace />
    }

    return children
}









