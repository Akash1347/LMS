import axios from "axios"

const AUTH_BASE_URL =
    import.meta.env.VITE_BACKEND_AUTH_URL ||
    (import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth`
        : "http://localhost:3000/api/auth")

const ENROLLMENT_BASE_URL =
    import.meta.env.VITE_BACKEND_ENROLLMENT_URL ||
    (import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/enrollment`
        : "http://localhost:3000/api/enrollment")

const COURSE_BASE_URL =
    import.meta.env.VITE_BACKEND_COURSE_URL ||
    (import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/course`
        : "http://localhost:3000/api/course")

const AUTH_TOKEN_KEY = "auth_token"

const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY)

const storeTokenFromResponse = (res) => {
    const tokenFromBody = res?.data?.token
    const authHeader = res?.headers?.authorization
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null

    const token = tokenFromBody || tokenFromHeader
    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
    }

    return token
}

export const registerApi = async (payload) => {
    const res = await axios.post(`${AUTH_BASE_URL}/register`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
        }


    )

    storeTokenFromResponse(res)
    return res.data
}

export const loginApi = async (payload) => {
    const res = await axios.post(`${AUTH_BASE_URL}/login`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
        }


    )

    storeTokenFromResponse(res)
    return res.data
}

export const getUserDataApi = async () => {
    const token = getStoredToken()
    const res = await axios.get(`${AUTH_BASE_URL}/me`,

        {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            withCredentials: true
        }


    )
    return res.data
}

export const logoutApi = async () => {
    const token = getStoredToken()
    const res = await axios.post(`${AUTH_BASE_URL}/logout`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            withCredentials: true
        }
    )
    localStorage.removeItem(AUTH_TOKEN_KEY)
    return res.data;
}

export const getUserCourse = async () => {
    const token = getStoredToken()
    console.log("[getUserCourse] Calling my-enrollments API...")
    const res = await axios.get(`${ENROLLMENT_BASE_URL}/my-enrollments`,

        {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            withCredentials: true
        }


    )
    const contentType = res?.headers?.["content-type"] || ""
    if (typeof res.data === "string" && contentType.includes("text/html")) {
        throw new Error("Enrollment API returned HTML. Check VITE_BACKEND_ENROLLMENT_URL in frontend/.env")
    }
    console.log("[getUserCourse] Response:", res.data)
    return res.data

}

export const getCoursesOfInstructor = async() => {
    const token = getStoredToken()
    const res = await axios.get(`${COURSE_BASE_URL}/instructor/courses`,

        {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            withCredentials: true
        }


    )
    return res.data

}

export const getCourseDetailsOfUser = async() => {
    const token = getStoredToken()
    const res = await axios.get(`${COURSE_BASE_URL}/bulk`,

        {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            withCredentials: true
        }


    )
    return res.data

}