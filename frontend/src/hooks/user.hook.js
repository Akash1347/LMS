import { getUserDataApi, loginApi, logoutApi, registerApi } from "@/Api/user.api"
import { useAuthStore, useCourseStore } from "@/Store/user.store"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const getErrorMessage = (err) => {
    return err?.response?.data?.message || err?.message || "Something went wrong"
}

export const useRegisterHook = () => {
    const navigate = useNavigate()
    return useMutation({
        mutationFn: registerApi,
        onSuccess: (data) => {
            console.log(data)
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
    return useMutation({
        mutationFn: loginApi,
        onSuccess: (data) => {
            console.log(data)
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