import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SupplierProfile,
  SupplierProfileSchema,
} from './schemas/supplier-profile.schema';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupplierProfile.name, schema: SupplierProfileSchema },
    ]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService, MongooseModule],
})
export class SuppliersModule {}
