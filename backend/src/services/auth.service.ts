import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { IAuthResponse, IRegisterData, IVerifyEmailData, IResetPasswordData } from '../interfaces/auth.interface';
import { generateOTP, sendEmail } from '../utils/email.util';

class AuthService {
  private generateToken(id: string, role: string): string {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '30d',
    });
  }

  public async register(data: IRegisterData): Promise<IAuthResponse> {
    const userExists = await User.findOne({ email: data.email });
    if (userExists) {
      throw new Error('User already exists');
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      ...data,
      otp,
      otpExpiresAt,
      isVerified: false,
    });

    await sendEmail({
      email: user.email,
      subject: 'Verify your AutoPart Store Account',
      message: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    });

    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      message: 'Registration successful. Please check your email for the OTP.',
      otp: otp, // TODO: Remove in production when Resend is configured
    };
  }

  public async verifyEmail(data: IVerifyEmailData): Promise<IAuthResponse> {
    const user = await User.findOne({ email: data.email });

    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('User already verified');
    if (user.otp !== data.otp) throw new Error('Invalid OTP');
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) throw new Error('OTP expired');

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: this.generateToken(user._id.toString(), user.role),
    };
  }

  public async login(email: string, password: string): Promise<IAuthResponse> {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        throw new Error('Please verify your email before logging in');
      }

      return {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: this.generateToken(user._id.toString(), user.role),
      };
    } else {
      throw new Error('Invalid email or password');
    }
  }

  public async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP',
      message: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
    });

    return `Password reset OTP sent to email. OTP: ${otp}`; // TODO: Remove OTP from response in production
  }

  public async resetPassword(data: IResetPasswordData): Promise<string> {
    const user = await User.findOne({ email: data.email });

    if (!user) throw new Error('User not found');
    if (user.otp !== data.otp) throw new Error('Invalid OTP');
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) throw new Error('OTP expired');

    user.passwordHash = data.newPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return 'Password has been reset successfully. You can now login.';
  }
}

export default new AuthService();
