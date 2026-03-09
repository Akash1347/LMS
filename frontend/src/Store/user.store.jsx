import { create } from "zustand"
import { devtools } from "zustand/middleware"

export const useAuthStore = create(
    devtools(
        (set) => ({
            user: null,
            isLoggedIn: false,

            login: (userData) =>
                set({
                    user: userData,
                    isLoggedIn: true
                }, false, "auth/login"),
            logout: () =>
                set({
                    user: null,
                    isLoggedIn: false
                }, false, "auth/logout"),
            clearAll: () => {
                set({
                    user: null,
                    isLoggedIn: false
                }, false, "auth/clearAll")
                const courseStore = useCourseStore.getState()
                courseStore.clearCourses()
            }

        }),
        { name: "AuthStore" }
    )
)

export const useCourseStore = create(
    devtools(
        (set) => ({
            enrolledCourses: [],
            createdCourses: [],
            role: null,
            setRole: (role) =>
                set({
                    role: role
                }, false, "course/setRole"),
            setEnrolledCourses: (courses) =>
                set({
                    enrolledCourses: courses
                }, false, "course/setEnrolledCourses"),

            setCreatedCourses: (courses) =>
                set({
                    createdCourses: courses
                }, false, "course/setCreatedCourses"),
            clearCourses: () => {
                set({
                    enrolledCourses: [],
                    createdCourses: [],
                    role: null,
                }, false, "course/clearCourses")
            }

        }),
        { name: "CourseStore" }
    )
)