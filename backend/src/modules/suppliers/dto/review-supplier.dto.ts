import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewSupplierDto {
  @IsEnum(['approved', 'rejected'])
  approvalStatus: 'approved' | 'rejected';

  @IsBoolean()
  @IsOptional()
  verifiedBadge?: boolean;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
