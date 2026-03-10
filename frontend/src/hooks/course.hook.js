import {
    createCourseApi,
    createLessonApi,
    createQuizApi,
    createModuleApi,
    deleteCourseApi,
    deleteLessonApi,
    deleteModuleApi,
    enrollInCourseApi,
    getCourseDetailsApi,
    getCourseEnrollmentAnalyticsApi,
    getLessonsByModuleIdApi,
    getModulesByCourseIdApi,
    getCoursesApi,
    updateCourseApi,
    updateModuleApi,
    getBulkCourseApi,
    startQuizApi,
    submitQuizAttemptApi,
    getQuizLeaderboardApi,
    getQuizDetailedAnalyticsApi,
} from "@/Api/course.api"
import { getCoursesOfInstructor, getUserCourse } from "@/Api/user.api"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

const getErrorMessage = (err) => {
    return err?.response?.data?.message || err?.message || "Something went wrong"
}

const getSuccessMessage = (res, fallback) => {
    return res?.data?.message || fallback
}

export const useCreateCourseHook = () => {
    return useMutation({
        mutationFn: createCourseApi,
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Course created successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useCreateModuleHook = () => {
    return useMutation({
        mutationFn: ({ courseId, payload }) => createModuleApi(courseId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Module created successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useCreateLessonHook = () => {
    return useMutation({
        mutationFn: ({ moduleId, payload, onUploadProgress }) => createLessonApi(moduleId, payload, onUploadProgress),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Lesson created successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useCreateQuizHook = () => {
    return useMutation({
        mutationFn: ({ moduleId, payload }) => createQuizApi(moduleId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Quiz created successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useUpdateCourseHook = () => {
    return useMutation({
        mutationFn: ({ courseId, payload }) => updateCourseApi(courseId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Course updated successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useUpdateModuleHook = () => {
    return useMutation({
        mutationFn: ({ moduleId, payload }) => updateModuleApi(moduleId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Module updated successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useDeleteCourseHook = () => {
    return useMutation({
        mutationFn: (courseId) => deleteCourseApi(courseId),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Course deleted successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useDeleteModuleHook = () => {
    return useMutation({
        mutationFn: (moduleId) => deleteModuleApi(moduleId),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Module deleted successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useDeleteLessonHook = () => {
    return useMutation({
        mutationFn: ({ lessonId, payload }) => deleteLessonApi(lessonId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Lesson deleted successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useGetCoursesHook = () => {
    return useQuery({
        queryFn: getCoursesApi,
        queryKey: ['getCourses']
    })
}

export const useGetUserCourseHook = (enabled = true) => {
    return useQuery({
        queryFn: getUserCourse,
        queryKey: ['getUserCourse'],
        enabled,
    })
}

export const useGetCourseOfInstructorHook = (enabled = true) => {
    return useQuery({
        queryFn: getCoursesOfInstructor,
        queryKey: ['getCourseOfInstructor'],
        enabled,
    })
}

export const useGetBulkCourseByIdsHook = (courseIds = [], enabled = true) => {
    return useQuery({
        queryFn: () => getBulkCourseApi(courseIds),
        queryKey: ['getBulkCourseByIds', courseIds],
        enabled: enabled && Array.isArray(courseIds) && courseIds.length > 0,
    })
}

export const useGetCourseDetailsHook = (courseId, enabled = true) => {
    return useQuery({
        queryFn: () => getCourseDetailsApi(courseId),
        queryKey: ['getCourseDetails', courseId],
        enabled: Boolean(enabled && courseId),
    })
}

export const useGetCourseEnrollmentAnalyticsHook = (courseId, enabled = true) => {
    return useQuery({
        queryFn: () => getCourseEnrollmentAnalyticsApi(courseId),
        queryKey: ['getCourseEnrollmentAnalytics', courseId],
        enabled: Boolean(enabled && courseId),
    })
}

export const useGetModulesByCourseIdHook = (courseId, enabled = true) => {
    return useQuery({
        queryFn: () => getModulesByCourseIdApi(courseId),
        queryKey: ['getModulesByCourseId', courseId],
        enabled: Boolean(enabled && courseId),
    })
}

export const useGetLessonsByModuleIdHook = (moduleId, enabled = true) => {
    return useQuery({
        queryFn: () => getLessonsByModuleIdApi(moduleId),
        queryKey: ['getLessonsByModuleId', moduleId],
        enabled: Boolean(enabled && moduleId),
    })
}

export const useEnrollInCourseHook = () => {
    return useMutation({
        mutationFn: (courseId) => enrollInCourseApi(courseId),
        onSuccess: (res) => {
            toast.success(res?.message || "Enrolled in course successfully")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useStartQuizHook = () => {
    return useMutation({
        mutationFn: ({ courseId, quizId }) => startQuizApi(courseId, quizId),
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useSubmitQuizAttemptHook = () => {
    return useMutation({
        mutationFn: ({ attemptId, answer }) => submitQuizAttemptApi(attemptId, answer),
        onSuccess: () => {
            toast.success("Quiz submitted successfully")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useGetQuizLeaderboardHook = (quizId, enabled = true) => {
    return useQuery({
        queryFn: () => getQuizLeaderboardApi(quizId),
        queryKey: ['getQuizLeaderboard', quizId],
        enabled: Boolean(enabled && quizId),
    })
}

export const useGetQuizDetailedAnalyticsHook = (quizId, enabled = true) => {
    return useQuery({
        queryFn: () => getQuizDetailedAnalyticsApi(quizId),
        queryKey: ['getQuizDetailedAnalytics', quizId],
        enabled: Boolean(enabled && quizId),
    })
}
