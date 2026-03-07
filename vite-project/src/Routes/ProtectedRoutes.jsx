import { useGetUserDataHook } from "@/hooks/user.hook"
import { useUserStore } from "@/Store/user.store"
import { useEffect } from "react"
import { Navigate } from "react-router-dom"


export const ProtectecRoutes = ({ children }) => {
    const setUser = useUserStore((state) => state.setUser)
    const { data, isLoading } = useGetUserDataHook()

    useEffect(() => {
        if (data?.userData) {
            setUser(data.userData)
        }
    }, [data, setUser])

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!data?.userData) {
        return <Navigate to={'/login'} replace />
    }

    return children
}


