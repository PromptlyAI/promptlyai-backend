import { Role } from '@prisma/client'
import { UUID } from 'crypto'

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface UserDto {
  email: string
  password: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  newPassword: string
}

export interface PatchUserDto {
  id: UUID
  email?: string
  name?: string
  totalTokenBalance?: number
  role?: Role
  banExpirationDate?: Date
}

