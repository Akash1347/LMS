import axios from "axios"
const AUTH_BASE_URL =
    import.meta.env.BACKEND_AUTH_URL ||
    (import.meta.env.BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth`
        : "http://localhost:3000/api/auth")

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