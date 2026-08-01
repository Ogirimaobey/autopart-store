import User, { IUser } from '../models/user.model';
import { IUpdateProfileData, IChangePasswordData } from '../interfaces/user.interface';

class UserService {
  public async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-passwordHash -otp -otpExpiresAt');
    if (!user) throw new Error('User not found');
    return user;
  }

  public async updateProfile(userId: string, data: IUpdateProfileData): Promise<IUser> {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) throw new Error('User not found');

    if (data.fullName) user.fullName = data.fullName;
    // Phone could be added to schema later, omitted for brevity here unless requested
    if (data.address) user.address = data.address;

    const updatedUser = await user.save();
    return updatedUser;
  }

  public async changePassword(userId: string, data: IChangePasswordData): Promise<string> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (!data.oldPassword || !data.newPassword) {
      throw new Error('Please provide old and new password');
    }

    const isMatch = await user.matchPassword(data.oldPassword);
    if (!isMatch) {
      throw new Error('Incorrect old password');
    }

    user.passwordHash = data.newPassword;
    await user.save();

    return 'Password changed successfully';
  }
}

export default new UserService();
