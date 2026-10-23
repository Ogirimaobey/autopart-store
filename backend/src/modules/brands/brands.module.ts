import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VehicleBrand,
  VehicleBrandSchema,
} from './schemas/vehicle-brand.schema';
import {
  VehicleModel,
  VehicleModelSchema,
} from './schemas/vehicle-model.schema';
import { PartBrand, PartBrandSchema } from './schemas/part-brand.schema';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VehicleBrand.name, schema: VehicleBrandSchema },
      { name: VehicleModel.name, schema: VehicleModelSchema },
      { name: PartBrand.name, schema: PartBrandSchema },
    ]),
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService, MongooseModule],
})
export class BrandsModule {}
