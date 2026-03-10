import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLogoutHook } from '@/hooks/user.hook'
import { useAuthStore } from '@/Store/user.store'
import { motion } from 'framer-motion'

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [open, setOpen] = useState(false)
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const user = useAuthStore((state) => state.user)
    const { mutate, isPending } = useLogoutHook()

    const role = String(user?.role || '').toLowerCase()
    const coursesPath = role === 'student' ? '/user-course' : '/instructor-course'
    const coursesLabel = role === 'student' ? 'My Courses' : 'Created Courses'

    if (!isLoggedIn) return null

    const handleLogout = () => {
        mutate(undefined, {
            onSuccess: () => navigate('/'),
            onError: () => navigate('/'),
        })
    }

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Home', path: '/home' },
        { name: 'Courses', path: '/course' },
        { name: coursesLabel, path: coursesPath },
    ]

    return (
        <header className='sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/70 backdrop-blur-md'>
            <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
                
                {/* ── Logo Brand ── */}
                <div 
                    className='flex cursor-pointer items-center gap-3' 
                    onClick={() => navigate('/home')}
                >
                    <div className='flex h-8 w-8 items-center justify-center rounded bg-zinc-900'>
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5'>
                            <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
                        </svg>
                    </div>
                    <span className='text-lg font-bold tracking-tight text-zinc-900'>EduSmart</span>
                </div>

                {/* ── Navigation Links ── */}
                <nav className='hidden items-center gap-8 md:flex'>
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path
                        return (
                            <button
                                key={link.name}
                                onClick={() => navigate(link.path)}
                                className={`relative text-sm font-medium transition-colors hover:text-zinc-900 focus:outline-none ${
                                    isActive ? 'text-zinc-900' : 'text-zinc-500'
                                }`}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-zinc-900"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* ── Profile Actions ── */}
                <div className='flex items-center gap-4'>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex cursor-pointer items-center justify-center rounded-full p-0 outline-none ring-2 ring-transparent transition-all hover:ring-zinc-200 focus:ring-zinc-200"
                            >
                                <Avatar className="h-9 w-9 border border-zinc-200">
                                    <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
                                    <AvatarFallback className="bg-zinc-100 text-zinc-900 font-medium">
                                        {user?.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.button>
                        </PopoverTrigger>

                        <PopoverContent 
                            className="w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl" 
                            align="end"
                            sideOffset={8}
                        >
                            <div className="border-b border-zinc-100 px-3 py-2.5">
                                <p className="text-sm font-medium text-zinc-900">{user?.name || 'Student'}</p>
                                <p className="text-xs text-zinc-500 truncate">{user?.email || 'student@example.com'}</p>
                            </div>
                            
                            <div className="flex flex-col p-1">
                                <button 
                                    onClick={() => { setOpen(false); navigate('/profile'); }}
                                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                >
                                    Profile
                                </button>
                                <button 
                                    onClick={() => { setOpen(false); navigate('/settings'); }}
                                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                >
                                    Settings
                                </button>
                            </div>

                            <div className="border-t border-zinc-100 p-1">
                                <button 
                                    onClick={handleLogout} 
                                    disabled={isPending}
                                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                                >
                                    {isPending ? 'Logging out...' : 'Log out'}
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

            </div>
        </header>
    )
}

export default Navbar