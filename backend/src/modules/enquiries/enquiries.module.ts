import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enquiry, EnquirySchema } from './schemas/enquiry.schema';
import { EnquiriesService } from './enquiries.service';
import { EnquiriesController } from './enquiries.controller';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Enquiry.name, schema: EnquirySchema }]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [EnquiriesController],
  providers: [EnquiriesService],
  exports: [EnquiriesService, MongooseModule],
})
export class EnquiriesModule {}
