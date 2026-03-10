import axios from "axios"

const AUTH_TOKEN_KEY = "auth_token"
const COURSE_BASE_URL =
    import.meta.env.VITE_BACKEND_COURSE_URL ||
    (import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/course`
        : "http://localhost:3000/api/course")

const ENROLLMENT_BASE_URL =
    import.meta.env.VITE_BACKEND_ENROLLMENT_URL ||
    (import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/enrollment`
        : "http://localhost:3000/api/enrollment")

const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY)

const getAuthConfig = (contentType = "application/json") => {
    const token = getStoredToken()
    return {
        headers: {
            ...(contentType ? { "Content-Type": contentType } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        withCredentials: true,
    }
}

export const createCourseApi = async (payload) => {
    const isFormData = payload instanceof FormData
    const res = await axios.post(
        `${COURSE_BASE_URL}/`,
        payload,
        getAuthConfig(isFormData ? null : "application/json")
    )
    return res
}

export const createModuleApi = async (courseId, payload) => {
    const res = await axios.post(`${COURSE_BASE_URL}/${courseId}/modules`, payload, getAuthConfig())
    return res
}

export const createLessonApi = async (moduleId, payload, onUploadProgress) => {
    const res = await axios.post(
        `${COURSE_BASE_URL}/modules/${moduleId}/lessons`,
        payload,
        {
            ...getAuthConfig("multipart/form-data"),
            ...(onUploadProgress ? { onUploadProgress } : {}),
        }
    )
    return res
}

export const createQuizApi = async (moduleId, payload) => {
    const res = await axios.post(
        `${COURSE_BASE_URL}/modules/${moduleId}/quiz`,
        payload,
        getAuthConfig()
    )
    return res
}

export const updateCourseApi = async (courseId, payload) => {
    const res = await axios.patch(`${COURSE_BASE_URL}/${courseId}`, payload, getAuthConfig())
    return res
}

export const updateModuleApi = async (moduleId, payload) => {
    const res = await axios.patch(`${COURSE_BASE_URL}/modules/${moduleId}`, payload, getAuthConfig())
    return res
}

export const deleteCourseApi = async (courseId) => {
    const res = await axios.delete(`${COURSE_BASE_URL}/${courseId}`, getAuthConfig())
    return res
}

export const deleteModuleApi = async (moduleId) => {
    const res = await axios.delete(`${COURSE_BASE_URL}/modules/${moduleId}`, getAuthConfig())
    return res
}

export const deleteLessonApi = async (lessonId, payload = {}) => {
    const res = await axios.delete(`${COURSE_BASE_URL}/lessons/${lessonId}`, {
        ...getAuthConfig(),
        data: payload,
    })
    return res
}

export const getCoursesApi = async () => {
    const res = axios.get(`${COURSE_BASE_URL}`)
    return res
}

export const getCourseDetailsApi = async (courseId) => {
    const res = await axios.get(`${COURSE_BASE_URL}/${courseId}`, getAuthConfig())
    return res.data
}

export const getModulesByCourseIdApi = async (courseId) => {
    const res = await axios.get(`${COURSE_BASE_URL}/${courseId}/modules`, getAuthConfig())
    return res.data
}

export const getLessonsByModuleIdApi = async (moduleId) => {
    const res = await axios.get(`${COURSE_BASE_URL}/modules/${moduleId}/lessons`, getAuthConfig())
    return res.data
}

export const getCourseEnrollmentAnalyticsApi = async (courseId) => {
    const res = await axios.get(`${ENROLLMENT_BASE_URL}/analytics/${courseId}`)
    return res.data
}

export const enrollInCourseApi = async (courseId) => {
    const res = await axios.post(
        `${ENROLLMENT_BASE_URL}/enroll`,
        { courseId },
        getAuthConfig()
    )
    return res.data
}

export const startQuizApi = async (courseId, quizId) => {
    const res = await axios.post(
        `${COURSE_BASE_URL}/${courseId}/quizzes/${quizId}/start`,
        {},
        getAuthConfig()
    )
    return res.data
}

export const submitQuizAttemptApi = async (attemptId, answer) => {
    const res = await axios.post(
        `${COURSE_BASE_URL}/quiz-attempts/${attemptId}`,
        { answer },
        getAuthConfig()
    )
    return res.data
}

export const getQuizLeaderboardApi = async (quizId) => {
    const res = await axios.get(`${COURSE_BASE_URL}/quizzes/${quizId}/analytics`, getAuthConfig())
    return res.data
}

export const getQuizDetailedAnalyticsApi = async (quizId) => {
    const res = await axios.get(`${COURSE_BASE_URL}/quiz/${quizId}/analytics`, getAuthConfig())
    return res.data
}

export const getBulkCourseApi = async (courseIds = []) => {
    const normalizedIds = Array.isArray(courseIds)
        ? courseIds.filter(Boolean)
        : []

    if (normalizedIds.length === 0) {
        return { success: true, data: [] }
    }

    const res = await axios.get(`${COURSE_BASE_URL}/bulk`, {
        ...getAuthConfig(),
        params: {
            course_ids: normalizedIds.join(","),
        },
    })

    return res.data
}













