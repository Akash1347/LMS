import { getUserDataApi, loginApi, logoutApi, registerApi } from "@/Api/user.api"
import { useAuthStore, useCourseStore } from "@/Store/user.store"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const getErrorMessage = (err) => {
    return err?.response?.data?.message || err?.message || "Something went wrong"
}

const normalizeUser = (payload) => {
    const user = payload?.user || payload?.data?.user || payload?.userData || payload?.data || null
    if (!user) return null

    return {
        id: user.user_id || user.id,
        name: user.user_name || user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
    }
}

export const useRegisterHook = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    return useMutation({
        mutationFn: registerApi,
        onSuccess: async (data, variables) => {
            console.log(data)
            const me = await getUserDataApi().catch(() => null)
            const normalizedUser = normalizeUser(me || data)
            login(normalizedUser || {
                name: variables?.username || 'User',
                email: variables?.email,
                role: variables?.role,
            })
            toast.success(data.message)
            navigate('/')
        },
        onError: (err) => {
            console.log(err)
            toast.error(getErrorMessage(err))
        }
    })
}

export const useLoginHook = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    return useMutation({
        mutationFn: loginApi,
        onSuccess: async (data, variables) => {
            console.log(data)
            const me = await getUserDataApi().catch(() => null)
            const normalizedUser = normalizeUser(me || data)
            login(normalizedUser || {
                name: variables?.email?.split('@')?.[0] || 'User',
                email: variables?.email,
                role: 'student',
            })
            toast.success(data.message)
            navigate('/')
        },
        onError: (err) => {
            console.log(err)
            toast.error(getErrorMessage(err))
        }
    })
}

export const useGetUserDataHook = () => {
    const hasToken = Boolean(localStorage.getItem("auth_token"))
    return useQuery({
        queryFn: getUserDataApi,
        queryKey: ['getUser'],
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    })
}

export const useLogoutHook = () => {
    const logout = useAuthStore((state) => state.logout)
    const clearCourses = useCourseStore((state) => state.clearCourses)

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: (data) => {
            logout()
            clearCourses()
            console.log(data)
            toast.success(data.message)
        },
        onError: (err) => {
            const status = err?.response?.status
            // If token/session is already invalid, still clear client auth state.
            if (status === 401 || status === 403) {
                logout()
                clearCourses()
                toast.success("Logged out")
                return
            }
            console.log(err)
            toast.error(getErrorMessage(err))
        }
    })
}