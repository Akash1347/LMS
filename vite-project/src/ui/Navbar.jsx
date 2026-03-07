import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLogoutHook } from '@/hooks/user.hook'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const {mutate, isPinding} = useLogoutHook();
    const handleLogout = () => {
         mutate({
            onSuccess:() => {
                console.log("loggedOut Successfully!!!")
                 
            }
         })
    }

    return (
        <div className='h-[12vh] w-full flex items-center justify-between px-9 shadow'>
            <h1>EduSmart</h1>

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
                        <p className="font-medium cursor-pointer" onClick={handleLogout}>Logout</p>
                    </div>
                </PopoverContent>
            </Popover>

        </div>
    )
}

export default Navbar
