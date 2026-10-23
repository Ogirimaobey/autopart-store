import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../modules/users/schemas/user.schema';
import {
  Category,
  CategoryDocument,
} from '../modules/categories/schemas/category.schema';
import {
  VehicleBrand,
  VehicleBrandDocument,
} from '../modules/brands/schemas/vehicle-brand.schema';
import {
  VehicleModel,
  VehicleModelDocument,
} from '../modules/brands/schemas/vehicle-model.schema';
import {
  PartBrand,
  PartBrandDocument,
} from '../modules/brands/schemas/part-brand.schema';
import {
  SupplierProfile,
  SupplierProfileDocument,
} from '../modules/suppliers/schemas/supplier-profile.schema';
import {
  Product,
  ProductDocument,
  ProductCondition,
  ProductStatus,
} from '../modules/products/schemas/product.schema';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcryptjs';
import slugify from 'slugify';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SupplierProfile.name)
    private supplierProfileModel: Model<SupplierProfileDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(VehicleBrand.name)
    private vehicleBrandModel: Model<VehicleBrandDocument>,
    @InjectModel(VehicleModel.name)
    private vehicleModelModel: Model<VehicleModelDocument>,
    @InjectModel(PartBrand.name)
    private partBrandModel: Model<PartBrandDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async seedAll(): Promise<{ message: string; seeded: any }> {
    const admin = await this.seedAdmin();
    const categories = await this.seedCategories();
    const brands = await this.seedVehicleBrandsAndModels();
    const partBrands = await this.seedPartBrands();
    const supplier = await this.seedSupplier();
    const products = await this.seedProducts();

    return {
      message: 'Database successfully seeded with baseline automotive data',
      seeded: {
        adminCreated: !!admin,
        categoriesCount: categories.length,
        vehicleBrandsCount: brands.brandsCount,
        vehicleModelsCount: brands.modelsCount,
        partBrandsCount: partBrands.length,
        supplierCreated: !!supplier,
        productsCount: products.length,
      },
    };
  }

  async seedAdmin() {
    const adminEmail = 'admin@autoparts.ng';
    const existing = await this.userModel.findOne({ email: adminEmail });
    if (existing) {
      this.logger.log('Admin user already exists');
      return null;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('AdminPass123!', salt);

    const admin = new this.userModel({
      fullName: 'System Administrator',
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      phone: '+2348000000000',
      status: 'active',
      isEmailVerified: true,
    });

    await admin.save();
    this.logger.log('Default admin seeded: admin@autoparts.ng / AdminPass123!');
    return admin;
  }

  async seedCategories() {
    const count = await this.categoryModel.countDocuments();
    if (count > 0) {
      this.logger.log('Categories already populated');
      return [];
    }

    const initialCategories = [
      {
        name: 'Engine & Drivetrain',
        description:
          'Cylinder heads, pistons, camshafts, engine blocks, timing belts and complete engine assemblies',
        displayOrder: 1,
      },
      {
        name: 'Braking System',
        description:
          'Brake pads, rotors, calipers, master cylinders, ABS sensors and fluid',
        displayOrder: 2,
      },
      {
        name: 'Suspension & Steering',
        description:
          'Shock absorbers, control arms, ball joints, steering racks, sway bars and tie rods',
        displayOrder: 3,
      },
      {
        name: 'Transmission & Drivetrain',
        description:
          'Gearboxes, clutches, flywheels, torque converters, CV axles and differentials',
        displayOrder: 4,
      },
      {
        name: 'Electrical & Lighting',
        description:
          'Alternators, starters, batteries, spark plugs, sensors, headlights and taillights',
        displayOrder: 5,
      },
      {
        name: 'Air Conditioning & Cooling',
        description:
          'Radiators, water pumps, AC compressors, condensers, thermostats and cooling fans',
        displayOrder: 6,
      },
      {
        name: 'Body & Exterior Parts',
        description:
          'Bumpers, fenders, hoods, grilles, side mirrors, doors and tailgates',
        displayOrder: 7,
      },
      {
        name: 'Exhaust & Fuel Systems',
        description:
          'Fuel pumps, injectors, catalytic converters, mufflers and oxygen sensors',
        displayOrder: 8,
      },
      {
        name: 'Filters & Lubrication',
        description:
          'Engine oil filters, air filters, cabin filters, fuel filters and transmission fluids',
        displayOrder: 9,
      },
      {
        name: 'Wheels & Tires',
        description: 'Rims, tires, wheel hubs, lug nuts and TPMS sensors',
        displayOrder: 10,
      },
    ];

    const docs: any[] = [];
    for (const cat of initialCategories) {
      const slug = slugify(cat.name, { lower: true, strict: true });
      const created = await this.categoryModel.create({
        ...cat,
        slug,
        isActive: true,
      });
      docs.push(created);
    }

    this.logger.log(`Seeded ${docs.length} automotive categories`);
    return docs;
  }

  async seedVehicleBrandsAndModels() {
    const brandCount = await this.vehicleBrandModel.countDocuments();
    if (brandCount > 0) {
      this.logger.log('Vehicle brands already populated');
      return { brandsCount: 0, modelsCount: 0 };
    }

    const data: Array<{
      brand: string;
      models: Array<{
        name: string;
        yearStart: number;
        yearEnd?: number;
        engineCodes: string[];
      }>;
    }> = [
      {
        brand: 'Toyota',
        models: [
          {
            name: 'Corolla',
            yearStart: 2003,
            engineCodes: ['1ZZ-FE', '2ZR-FE', '1NZ-FE'],
          },
          {
            name: 'Camry',
            yearStart: 2002,
            engineCodes: ['2AZ-FE', '2AR-FE', '2GR-FE', '1MZ-FE'],
          },
          {
            name: 'RAV4',
            yearStart: 2006,
            engineCodes: ['2AZ-FE', '2AR-FE', 'A25A-FKS'],
          },
          {
            name: 'Highlander',
            yearStart: 2004,
            engineCodes: ['3MZ-FE', '2GR-FE'],
          },
          {
            name: 'Hilux',
            yearStart: 2005,
            engineCodes: ['1KD-FTV', '2KD-FTV', '2GD-FTV', '1TR-FE'],
          },
          {
            name: 'Land Cruiser / Prado',
            yearStart: 2003,
            engineCodes: ['1GR-FE', '2UZ-FE', '1VD-FTV'],
          },
        ],
      },
      {
        brand: 'Honda',
        models: [
          {
            name: 'Civic',
            yearStart: 2006,
            engineCodes: ['R18A', 'K20Z', 'L15B7'],
          },
          {
            name: 'Accord',
            yearStart: 2003,
            engineCodes: ['K24A', 'K24W', 'J30A', 'J35Y'],
          },
          {
            name: 'CR-V',
            yearStart: 2002,
            engineCodes: ['K24A', 'K24Z', 'L15BE'],
          },
          { name: 'Pilot', yearStart: 2005, engineCodes: ['J35A', 'J35Z'] },
        ],
      },
      {
        brand: 'Mercedes-Benz',
        models: [
          {
            name: 'C-Class (W203/W204/W205)',
            yearStart: 2001,
            engineCodes: ['M271', 'M272', 'M274', 'OM651'],
          },
          {
            name: 'E-Class (W211/W212/W213)',
            yearStart: 2003,
            engineCodes: ['M272', 'M276', 'OM642', 'M264'],
          },
          {
            name: 'ML / GLE (W164/W166)',
            yearStart: 2006,
            engineCodes: ['M272', 'M276', 'OM642', 'M157'],
          },
          {
            name: 'GLK / GLC (X204/X253)',
            yearStart: 2009,
            engineCodes: ['M272', 'M274', 'M276'],
          },
        ],
      },
      {
        brand: 'Lexus',
        models: [
          {
            name: 'ES350',
            yearStart: 2007,
            engineCodes: ['2GR-FE', '2GR-FKS'],
          },
          {
            name: 'RX350',
            yearStart: 2007,
            engineCodes: ['2GR-FE', '2GR-FXS'],
          },
          {
            name: 'GX460 / GX470',
            yearStart: 2003,
            engineCodes: ['2UZ-FE', '1UR-FE'],
          },
        ],
      },
      {
        brand: 'Nissan',
        models: [
          {
            name: 'Altima',
            yearStart: 2007,
            engineCodes: ['QR25DE', 'VQ35DE'],
          },
          {
            name: 'Pathfinder',
            yearStart: 2005,
            engineCodes: ['VQ35DE', 'VQ40DE'],
          },
          {
            name: 'Navara / NP300',
            yearStart: 2005,
            engineCodes: ['YD25DDTi', 'YS23DDT'],
          },
        ],
      },
      {
        brand: 'Ford',
        models: [
          {
            name: 'Explorer',
            yearStart: 2011,
            engineCodes: ['3.5L Ti-VCT', '3.5L EcoBoost', '2.3L EcoBoost'],
          },
          {
            name: 'Edge',
            yearStart: 2007,
            engineCodes: ['3.5L Duratec', '2.0L EcoBoost'],
          },
          {
            name: 'F-150',
            yearStart: 2009,
            engineCodes: ['5.0L Coyote', '3.5L EcoBoost'],
          },
        ],
      },
    ];

    let bCount = 0;
    let mCount = 0;

    for (const item of data) {
      const bSlug = slugify(item.brand, { lower: true, strict: true });
      const brand = await this.vehicleBrandModel.create({
        name: item.brand,
        slug: bSlug,
        isActive: true,
      });
      bCount++;

      for (const m of item.models) {
        const mSlug = slugify(m.name, { lower: true, strict: true });
        await this.vehicleModelModel.create({
          vehicleBrand: brand._id,
          name: m.name,
          slug: mSlug,
          yearStart: m.yearStart,
          popularEngineCodes: m.engineCodes,
          isActive: true,
        });
        mCount++;
      }
    }

    this.logger.log(`Seeded ${bCount} vehicle makes and ${mCount} models`);
    return { brandsCount: bCount, modelsCount: mCount };
  }

  async seedPartBrands() {
    const count = await this.partBrandModel.countDocuments();
    if (count > 0) {
      this.logger.log('Part brands already populated');
      return [];
    }

    const brands = [
      { name: 'Bosch', countryOfOrigin: 'Germany', isOem: true },
      { name: 'Denso', countryOfOrigin: 'Japan', isOem: true },
      { name: 'NGK', countryOfOrigin: 'Japan', isOem: true },
      { name: 'Brembo', countryOfOrigin: 'Italy', isOem: false },
      { name: 'Monroe', countryOfOrigin: 'USA', isOem: false },
      { name: 'KYB', countryOfOrigin: 'Japan', isOem: true },
      { name: 'Aisin', countryOfOrigin: 'Japan', isOem: true },
      { name: 'Mann-Filter', countryOfOrigin: 'Germany', isOem: true },
      { name: 'Delphi Technologies', countryOfOrigin: 'UK', isOem: true },
      { name: 'OEM Genuine', countryOfOrigin: 'Global', isOem: true },
    ];

    const docs: any[] = [];
    for (const b of brands) {
      const slug = slugify(b.name, { lower: true, strict: true });
      const created = await this.partBrandModel.create({
        ...b,
        slug,
        isActive: true,
      });
      docs.push(created);
    }

    this.logger.log(`Seeded ${docs.length} part manufacturers`);
    return docs;
  }

  async seedSupplier() {
    const supplierEmail = 'ladipo.parts@autoparts.ng';
    let supplierUser = await this.userModel.findOne({ email: supplierEmail });
    if (!supplierUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('SupplierPass123!', salt);

      supplierUser = await this.userModel.create({
        fullName: 'Ladipo Spare Parts Direct',
        email: supplierEmail,
        passwordHash,
        role: Role.SUPPLIER,
        phone: '+2348031234567',
        status: 'active',
        isEmailVerified: true,
      });

      await this.supplierProfileModel.create({
        user: supplierUser._id,
        businessName: 'Ladipo Genuine Spares Ltd',
        phone: '+2348031234567',
        address: {
          street: '14 Ladipo Auto Spare Parts Market',
          city: 'Mushin',
          state: 'Lagos',
          country: 'Nigeria',
        },
        cacNumber: 'RC-1849204',
        description:
          'Direct importers of high grade Japanese, German, and American original spare parts.',
        verifiedBadge: true,
        approvalStatus: 'approved',
        approvedAt: new Date(),
      });

      this.logger.log(
        'Default verified supplier seeded: ladipo.parts@autoparts.ng / SupplierPass123!',
      );
    }
    return supplierUser;
  }

  async seedProducts() {
    const count = await this.productModel.countDocuments();
    if (count > 0) {
      this.logger.log('Products already populated');
      return [];
    }

    const supplier = await this.seedSupplier();
    const [brakeCat, electCat, suspCat, coolCat] = await Promise.all([
      this.categoryModel.findOne({ slug: 'braking-system' }),
      this.categoryModel.findOne({ slug: 'electrical-and-lighting' }),
      this.categoryModel.findOne({ slug: 'suspension-and-steering' }),
      this.categoryModel.findOne({ slug: 'air-conditioning-and-cooling' }),
    ]);

    const [boschBrand, densoBrand, ngkBrand, monroeBrand, oemBrand] =
      await Promise.all([
        this.partBrandModel.findOne({ slug: 'bosch' }),
        this.partBrandModel.findOne({ slug: 'denso' }),
        this.partBrandModel.findOne({ slug: 'ngk' }),
        this.partBrandModel.findOne({ slug: 'monroe' }),
        this.partBrandModel.findOne({ slug: 'oem-genuine' }),
      ]);

    const toyota = await this.vehicleBrandModel.findOne({ slug: 'toyota' });
    const honda = await this.vehicleBrandModel.findOne({ slug: 'honda' });
    const mercedes = await this.vehicleBrandModel.findOne({
      slug: 'mercedes-benz',
    });
    const lexus = await this.vehicleBrandModel.findOne({ slug: 'lexus' });

    if (!brakeCat || !boschBrand || !supplier) {
      this.logger.warn(
        'Prerequisite categories or brands missing for product seeding',
      );
      return [];
    }

    const sampleProducts = [
      {
        title: 'Front Premium Ceramic Brake Pad Set for Toyota Camry & RAV4',
        slug: 'front-ceramic-brake-pads-toyota-camry-rav4',
        description:
          'Ultra-quiet ceramic brake pads engineered for exceptional stopping power with zero dust. Direct fit for 2.4L and 3.5L engines.',
        images: [
          'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800&q=80',
        ],
        price: 28500,
        discountPrice: 25000,
        stockQuantity: 35,
        condition: ProductCondition.NEW,
        category: brakeCat._id,
        partBrand: boschBrand._id,
        supplier: supplier._id,
        partNumber: '04465-33450',
        status: ProductStatus.ACTIVE,
        viewsCount: 142,
        salesCount: 18,
        compatibleVehicles: [
          {
            vehicleBrand: toyota?._id,
            vehicleBrandName: 'Toyota',
            vehicleModel: 'Camry',
            yearStart: 2002,
            yearEnd: 2017,
            engineTypes: ['2.4L 4-Cylinder', '3.5L V6'],
            engineNumbers: ['2AZ-FE', '2AR-FE', '2GR-FE'],
          },
          {
            vehicleBrand: toyota?._id,
            vehicleBrandName: 'Toyota',
            vehicleModel: 'RAV4',
            yearStart: 2006,
            yearEnd: 2016,
            engineTypes: ['2.4L 4-Cylinder', '2.5L 4-Cylinder'],
            engineNumbers: ['2AZ-FE', '2AR-FE'],
          },
        ],
      },
      {
        title:
          'High Performance 100A Alternator for Honda Accord & CR-V (2.4L)',
        slug: 'high-performance-alternator-honda-accord-cr-v',
        description:
          'Original equipment remanufactured alternator tested under harsh load conditions. Stable 14V charging output.',
        images: [
          'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&q=80',
        ],
        price: 65000,
        discountPrice: 59000,
        stockQuantity: 12,
        condition: ProductCondition.REFURBISHED,
        category: electCat?._id || brakeCat._id,
        partBrand: densoBrand?._id || boschBrand._id,
        supplier: supplier._id,
        partNumber: '104210-3380',
        status: ProductStatus.ACTIVE,
        viewsCount: 98,
        salesCount: 6,
        compatibleVehicles: [
          {
            vehicleBrand: honda?._id,
            vehicleBrandName: 'Honda',
            vehicleModel: 'Accord',
            yearStart: 2003,
            yearEnd: 2012,
            engineTypes: ['2.4L 4-Cylinder'],
            engineNumbers: ['K24A', 'K24Z'],
          },
          {
            vehicleBrand: honda?._id,
            vehicleBrandName: 'Honda',
            vehicleModel: 'CR-V',
            yearStart: 2002,
            yearEnd: 2011,
            engineTypes: ['2.4L 4-Cylinder'],
            engineNumbers: ['K24A', 'K24Z'],
          },
        ],
      },
      {
        title:
          'Laser Iridium Spark Plugs (Pack of 4) for Mercedes-Benz C200 / C250',
        slug: 'laser-iridium-spark-plugs-mercedes-benz-c-class',
        description:
          'Precision spark ignition with extreme resistance to electrical wear. Recommended service interval 100,000km.',
        images: [
          'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80',
        ],
        price: 42000,
        stockQuantity: 50,
        condition: ProductCondition.NEW,
        category: electCat?._id || brakeCat._id,
        partBrand: ngkBrand?._id || boschBrand._id,
        supplier: supplier._id,
        partNumber: 'ILFR6A-94968',
        status: ProductStatus.ACTIVE,
        viewsCount: 215,
        salesCount: 34,
        compatibleVehicles: [
          {
            vehicleBrand: mercedes?._id,
            vehicleBrandName: 'Mercedes-Benz',
            vehicleModel: 'C-Class (W203/W204/W205)',
            yearStart: 2008,
            yearEnd: 2015,
            engineTypes: ['1.8L Turbo', '2.0L Turbo'],
            engineNumbers: ['M271', 'M274'],
          },
        ],
      },
      {
        title:
          'Front Strut Shock Absorbers (Left & Right Pair) for Toyota Corolla',
        slug: 'front-strut-shock-absorbers-pair-toyota-corolla',
        description:
          'Heavy duty nitrogen-charged shock absorbers built for Nigerian road conditions. Excellent damping stability and comfort.',
        images: [
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
        ],
        price: 78000,
        discountPrice: 72000,
        stockQuantity: 15,
        condition: ProductCondition.NEW,
        category: suspCat?._id || brakeCat._id,
        partBrand: monroeBrand?._id || boschBrand._id,
        supplier: supplier._id,
        partNumber: '72115-72116',
        status: ProductStatus.ACTIVE,
        viewsCount: 165,
        salesCount: 11,
        compatibleVehicles: [
          {
            vehicleBrand: toyota?._id,
            vehicleBrandName: 'Toyota',
            vehicleModel: 'Corolla',
            yearStart: 2003,
            yearEnd: 2019,
            engineTypes: ['1.8L 4-Cylinder', '1.6L 4-Cylinder'],
            engineNumbers: ['1ZZ-FE', '2ZR-FE', '1NZ-FE'],
          },
        ],
      },
      {
        title: 'OEM Dual-Core Aluminum Engine Radiator for Lexus ES350 & RX350',
        slug: 'oem-dual-core-engine-radiator-lexus-es350-rx350',
        description:
          'Complete replacement cooling radiator designed for 3.5L 2GR-FE V6 engines. High-density fins for maximum heat dissipation.',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
        ],
        price: 92000,
        stockQuantity: 7,
        condition: ProductCondition.NEW,
        category: coolCat?._id || brakeCat._id,
        partBrand: oemBrand?._id || boschBrand._id,
        supplier: supplier._id,
        partNumber: '16400-31420',
        status: ProductStatus.ACTIVE,
        viewsCount: 180,
        salesCount: 8,
        compatibleVehicles: [
          {
            vehicleBrand: lexus?._id,
            vehicleBrandName: 'Lexus',
            vehicleModel: 'ES350',
            yearStart: 2007,
            yearEnd: 2016,
            engineTypes: ['3.5L V6'],
            engineNumbers: ['2GR-FE'],
          },
          {
            vehicleBrand: lexus?._id,
            vehicleBrandName: 'Lexus',
            vehicleModel: 'RX350',
            yearStart: 2007,
            yearEnd: 2015,
            engineTypes: ['3.5L V6'],
            engineNumbers: ['2GR-FE'],
          },
        ],
      },
    ];

    const createdDocs: any[] = [];
    for (const p of sampleProducts) {
      const doc = await this.productModel.create(p);
      createdDocs.push(doc);
    }

    this.logger.log(
      `Seeded ${createdDocs.length} automotive spare parts with engine compatibility`,
    );
    return createdDocs;
  }
}
