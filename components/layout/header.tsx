"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, LogOut, LogIn, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
import axios from "axios"
import { API_ENDPOINTS } from "@/app/config/api"
import { useUser } from "@/hooks/useUser"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

export function Header() {
  const router = useRouter()
  const { user, updateUser } = useUser()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    try {
      await axios.post(API_ENDPOINTS.logout)
      updateUser(null)
      localStorage.removeItem("token")
      router.push("/")
      toast.success("Đăng xuất thành công")
    } catch (error: any) {
      console.error("Logout error:", error)
      toast.error(error.response?.data?.message || "Lỗi khi đăng xuất")
    }
  }

  return (
    <>
      <header className="container mx-auto py-6 px-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">WeddingCard</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#features"
            className="hover:text-pink-400 transition"
          >
            Tính năng
          </Link>
          <Link
            href="/templates"
            className="hover:text-pink-400 transition"
          >
            Mẫu thiệp
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-pink-400 transition"
          >
            Cách thức
          </Link>
          <Link
            href="/#testimonials"
            className="hover:text-pink-400 transition"
          >
            Đánh giá
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <span className="hidden md:inline">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => router.push("/login")}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
          )}
        </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
