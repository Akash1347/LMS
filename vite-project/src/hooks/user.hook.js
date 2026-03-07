import { getUserDataApi, loginApi, logoutApi, registerApi } from "@/Api/user.api"
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
    return useQuery({
        queryFn: getUserDataApi,
        queryKey: ['getUser']
    })
}

export const useLogoutHook = () => {
    return useMutation({
        mutationFn: logoutApi,
        onSuccess: (data) => {
            console.log(data)
            toast.success(data.message)
        },
        onError: (err) => {
            console.log(err)
            toast.error(getErrorMessage(err))
        }
    })
}