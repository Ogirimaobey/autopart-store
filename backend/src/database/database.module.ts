import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from '../modules/users/users.module';
import { CategoriesModule } from '../modules/categories/categories.module';
import { BrandsModule } from '../modules/brands/brands.module';
import { SuppliersModule } from '../modules/suppliers/suppliers.module';
import { ProductsModule } from '../modules/products/products.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/autopart_marketplace',
      }),
    }),
    UsersModule,
    SuppliersModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService, MongooseModule],
})
export class DatabaseModule {}
