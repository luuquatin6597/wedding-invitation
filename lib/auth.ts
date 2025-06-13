// Đây là file mô phỏng authentication, trong thực tế bạn sẽ sử dụng NextAuth hoặc giải pháp xác thực khác

// Các loại người dùng có thể có
export type UserRole = "admin" | "user"

// Cấu trúc user
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string
}