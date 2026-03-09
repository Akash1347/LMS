import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLogoutHook } from '@/hooks/user.hook'
import { useAuthStore } from '@/Store/user.store'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    const navigate = useNavigate()
    const [open, setOpen] = React.useState(false)
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const user = useAuthStore((state) => state.user)
    const { mutate, isPending } = useLogoutHook();

    const role = String(user?.role || '').toLowerCase()
    const coursesPath = role === 'student' ? '/user-course' : '/instructor-course'
    const coursesLabel = role === 'student' ? 'My Courses' : 'Created Courses'

    if (!isLoggedIn) return null

    const handleLogout = () => {
         mutate(undefined, {
            onSuccess: () => {
                navigate('/')
            },
            onError: () => {
                navigate('/')
            },
         })
    }

    return (
        <div className='h-[12vh] w-full flex items-center justify-between px-9 shadow'>
            <h1>EduSmart</h1>

            <div className='flex items-center gap-4'>
                <button
                    type='button'
                    onClick={() => navigate(coursesPath)}
                    className='rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100'
                >
                    {coursesLabel}
                </button>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex cursor-pointer items-center justify-center rounded-full p-0 focus:outline-none"
                        >
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-48" align="end">
                        <div className="space-y-2">
                            <p className="font-medium  cursor-pointer">Profile</p>
                            <p className="text-sm text-muted-foreground  cursor-pointer ">Settings</p>
                            <button className="font-medium cursor-pointer" onClick={handleLogout} disabled={isPending}>Logout</button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

        </div>
    )
}

export default Navbar
