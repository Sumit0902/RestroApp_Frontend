import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { logout } from "@/store/features/auth/AuthSlice.js"
import { useDispatch } from "react-redux"
import { persistor } from "@/store/store.js"
import { useNavigate } from "react-router-dom"

export default function UserMenu({ userName = "John Doe", userEmail = "john@example.com", userAvatar = "/placeholder.svg?height=32&width=32" }) {
    const [open, setOpen] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
        persistor.purge();
        setTimeout(() => {
            navigate('/')
        }, 2000);
        setOpen(false)
    }
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="primary" className="bg-accent relative h-auto w-full justify-start px-2 py-3 hover:bg-accent hover:text-accent-foreground">
                    <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium">{userName}</span>
                        <span className="text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" alignOffset={11} sideOffset={-5} forceMount>
                <DropdownMenuItem onSelect={() => setOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setOpen(false)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}