export interface IUpdateProfileData {
  fullName?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface IChangePasswordData {
  oldPassword?: string;
  newPassword?: string;
}
