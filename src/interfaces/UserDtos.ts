export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface UserDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}


export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}


