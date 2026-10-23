import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.BUYER,
    index: true,
  })
  role: Role;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'active',
    index: true,
  })
  status: 'active' | 'pending' | 'suspended';

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  refreshTokenHash?: string;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hide sensitive fields when transformed to JSON
UserSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    ret.id = ret._id;
    return ret;
  },
});
