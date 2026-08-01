import User from '../models/user.model';
import SubOrder from '../models/subOrder.model';
import Order from '../models/order.model';

class AdminService {
  public async getAllUsers(): Promise<any> {
    return await User.find({}).select('-passwordHash');
  }

  public async toggleUserBan(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.role === ('SUPER_ADMIN' as any)) throw new Error('Cannot ban Super Admin');

    user.isActive = !user.isActive;
    await user.save();
    return user.isActive ? 'User unbanned' : 'User banned';
  }

  // Simplified KYC: If a user applied to be a vendor, an admin can approve them
  public async approveVendor(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.role = 'VENDOR';
    await user.save();
    return 'User approved as Vendor';
  }

  public async getPlatformStats(): Promise<any> {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingSubOrders = await SubOrder.countDocuments({ status: 'PENDING' });
    
    return {
      totalUsers,
      totalOrders,
      pendingSubOrders,
    };
  }
}

export default new AdminService();
