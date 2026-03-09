import axios from "axios"

const AUTH_TOKEN_KEY = "auth_token"
const COURSE_BASE_URL =
    import.meta.env.VITE_BACKEND_COURSE_URL ||
    (import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/course`
        : "http://localhost:3000/api/course")

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

export const createLessonApi = async (moduleId, payload) => {
    const res = await axios.post(
        `${COURSE_BASE_URL}/modules/${moduleId}/lessons`,
        payload,
        getAuthConfig("multipart/form-data")
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






