export interface IAuthResponse {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  token?: string;
  isVerified: boolean;
  message?: string;
  otp?: string;
}

export interface IRegisterData {
  fullName: string;
  email: string;
  passwordHash: string;
  role?: 'ADMIN' | 'VENDOR' | 'BUYER';
}

export interface IVerifyEmailData {
  email: string;
  otp: string;
}

export interface IResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}
