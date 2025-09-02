import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Dieline from '../models/Dieline';
import Carton from '../models/Carton';
import Assignment from '../models/Assignment';
import connectDB from '../config/database';

// Load environment variables
dotenv.config();

const seedAdvancedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Dieline.deleteMany({});
    await Carton.deleteMany({});
    await Assignment.deleteMany({});

    // Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@shelomgraphics.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'John Smith',
        email: 'john.smith@shelomgraphics.com',
        password: hashedPassword,
        role: 'employee'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@shelomgraphics.com',
        password: hashedPassword,
        role: 'employee'
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@shelomgraphics.com',
        password: hashedPassword,
        role: 'employee'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@shelomgraphics.com',
        password: hashedPassword,
        role: 'employee'
      }
    ]);

    const [adminUser, johnUser, sarahUser, mikeUser, emilyUser] = users;

    // Create comprehensive dielines
    console.log('📐 Creating dielines...');
    const dielines = await Dieline.insertMany([
      {
        name: 'Small Product Box - Electronics',
        dimensions: [
          { length: 150, breadth: 100, height: 50, ups: 1 },
          { length: 140, breadth: 95, height: 45, ups: 2 },
          { length: 160, breadth: 105, height: 55, ups: 1 }
        ],
        input: 'Electronics packaging for small devices like phones, tablets, accessories',
        createdBy: adminUser._id
      },
      {
        name: 'Phone Case Package',
        dimensions: [
          { length: 180, breadth: 90, height: 25, ups: 4 },
          { length: 170, breadth: 85, height: 22, ups: 6 },
          { length: 185, breadth: 95, height: 28, ups: 3 }
        ],
        input: 'Phone case packaging with protective foam inserts',
        createdBy: johnUser._id
      },
      {
        name: 'Cosmetic Box - Lipstick',
        dimensions: [
          { length: 120, breadth: 40, height: 40, ups: 6 },
          { length: 110, breadth: 38, height: 35, ups: 8 },
          { length: 125, breadth: 42, height: 45, ups: 4 }
        ],
        input: 'Cosmetic packaging for lipstick with premium finish',
        createdBy: sarahUser._id
      },
      {
        name: 'Medium Gift Box',
        dimensions: [
          { length: 250, breadth: 200, height: 100, ups: 1 },
          { length: 240, breadth: 190, height: 95, ups: 2 }
        ],
        input: 'Gift box for medium-sized items with elegant design',
        createdBy: adminUser._id
      },
      {
        name: 'Shoe Box - Standard',
        dimensions: [
          { length: 330, breadth: 200, height: 120, ups: 1 },
          { length: 310, breadth: 190, height: 110, ups: 2 },
          { length: 340, breadth: 210, height: 125, ups: 1 }
        ],
        input: 'Standard shoe box for athletic and casual footwear',
        createdBy: mikeUser._id
      },
      {
        name: 'Book Packaging',
        dimensions: [
          { length: 240, breadth: 170, height: 30, ups: 3 },
          { length: 220, breadth: 160, height: 25, ups: 4 },
          { length: 250, breadth: 180, height: 35, ups: 2 }
        ],
        input: 'Book packaging for paperback and hardcover books',
        createdBy: johnUser._id
      },
      {
        name: 'Large Shipping Box',
        dimensions: [
          { length: 400, breadth: 300, height: 200, ups: 1 },
          { length: 380, breadth: 280, height: 180, ups: 1 }
        ],
        input: 'Large shipping container for bulk items and multiple products',
        createdBy: adminUser._id
      },
      {
        name: 'Laptop Box',
        dimensions: [
          { length: 380, breadth: 260, height: 80, ups: 1 },
          { length: 360, breadth: 240, height: 70, ups: 2 },
          { length: 390, breadth: 270, height: 85, ups: 1 }
        ],
        input: 'Laptop packaging with protective foam and secure closure',
        createdBy: sarahUser._id
      },
      {
        name: 'Clothing Box - Large',
        dimensions: [
          { length: 350, breadth: 250, height: 150, ups: 1 },
          { length: 330, breadth: 230, height: 140, ups: 2 }
        ],
        input: 'Large clothing box for jackets, dresses, and bulky items',
        createdBy: mikeUser._id
      },
      {
        name: 'Wine Bottle Box',
        dimensions: [
          { length: 90, breadth: 90, height: 320, ups: 1 },
          { length: 85, breadth: 85, height: 310, ups: 2 },
          { length: 95, breadth: 95, height: 330, ups: 1 }
        ],
        input: 'Wine bottle packaging with protective dividers',
        createdBy: johnUser._id
      },
      {
        name: 'Pizza Box - Medium',
        dimensions: [
          { length: 320, breadth: 320, height: 40, ups: 1 },
          { length: 310, breadth: 310, height: 35, ups: 1 }
        ],
        input: 'Medium pizza box with grease-resistant coating',
        createdBy: adminUser._id
      },
      {
        name: 'Jewelry Box - Premium',
        dimensions: [
          { length: 100, breadth: 80, height: 60, ups: 4 },
          { length: 90, breadth: 75, height: 55, ups: 6 },
          { length: 110, breadth: 85, height: 65, ups: 3 }
        ],
        input: 'Premium jewelry box with velvet lining and secure clasp',
        createdBy: sarahUser._id
      },
      {
        name: 'Food Container Box',
        dimensions: [
          { length: 200, breadth: 150, height: 80, ups: 2 },
          { length: 190, breadth: 140, height: 75, ups: 3 }
        ],
        input: 'Food container packaging for takeaway and delivery',
        createdBy: emilyUser._id
      },
      {
        name: 'Perfume Box - Luxury',
        dimensions: [
          { length: 80, breadth: 60, height: 120, ups: 6 },
          { length: 75, breadth: 55, height: 115, ups: 8 }
        ],
        input: 'Luxury perfume packaging with magnetic closure',
        createdBy: adminUser._id
      },
      {
        name: 'Tablet Box',
        dimensions: [
          { length: 280, breadth: 200, height: 20, ups: 2 },
          { length: 270, breadth: 190, height: 18, ups: 3 }
        ],
        input: 'Tablet packaging with anti-static protection',
        createdBy: johnUser._id
      }
    ]);

    // Create comprehensive cartons
    console.log('📦 Creating cartons...');
    const cartons = await Carton.insertMany([
      {
        name: 'Small Electronics Carton A',
        length: 148,
        breadth: 102,
        height: 52,
        quantity: 500,
        availableQuantity: 450,
        totalQuantity: 500,
        companyName: 'TechPack Solutions',
        createdBy: adminUser._id
      },
      {
        name: 'Small Electronics Carton B',
        length: 152,
        breadth: 98,
        height: 48,
        quantity: 300,
        availableQuantity: 280,
        totalQuantity: 300,
        companyName: 'ElectroBox Ltd',
        createdBy: johnUser._id
      },
      {
        name: 'Phone Case Carton',
        length: 182,
        breadth: 88,
        height: 27,
        quantity: 1000,
        availableQuantity: 900,
        totalQuantity: 1000,
        companyName: 'MobilePackaging Co',
        createdBy: sarahUser._id
      },
      {
        name: 'Cosmetic Carton - Small',
        length: 118,
        breadth: 42,
        height: 38,
        quantity: 800,
        availableQuantity: 720,
        totalQuantity: 800,
        companyName: 'BeautyBox Industries',
        createdBy: mikeUser._id
      },
      {
        name: 'Medium Gift Carton A',
        length: 245,
        breadth: 205,
        height: 95,
        quantity: 200,
        availableQuantity: 170,
        totalQuantity: 200,
        companyName: 'GiftWrap Specialists',
        createdBy: adminUser._id
      },
      {
        name: 'Medium Gift Carton B',
        length: 255,
        breadth: 195,
        height: 105,
        quantity: 150,
        availableQuantity: 130,
        totalQuantity: 150,
        companyName: 'Premium Packaging',
        createdBy: johnUser._id
      },
      {
        name: 'Shoe Carton - Standard',
        length: 325,
        breadth: 205,
        height: 115,
        quantity: 400,
        availableQuantity: 340,
        totalQuantity: 400,
        companyName: 'FootwearBox Corp',
        createdBy: sarahUser._id
      },
      {
        name: 'Shoe Carton - Premium',
        length: 335,
        breadth: 195,
        height: 125,
        quantity: 250,
        availableQuantity: 210,
        totalQuantity: 250,
        companyName: 'LuxuryShoe Packaging',
        createdBy: mikeUser._id
      },
      {
        name: 'Book Carton',
        length: 238,
        breadth: 172,
        height: 32,
        quantity: 600,
        availableQuantity: 450,
        totalQuantity: 600,
        companyName: 'BookPack Solutions',
        createdBy: adminUser._id
      },
      {
        name: 'Large Shipping Carton A',
        length: 390,
        breadth: 310,
        height: 190,
        quantity: 100,
        availableQuantity: 80,
        totalQuantity: 100,
        companyName: 'MegaShip Containers',
        createdBy: johnUser._id
      },
      {
        name: 'Large Shipping Carton B',
        length: 410,
        breadth: 290,
        height: 210,
        quantity: 80,
        availableQuantity: 60,
        totalQuantity: 80,
        companyName: 'GlobalBox Logistics',
        createdBy: sarahUser._id
      },
      {
        name: 'Laptop Carton',
        length: 375,
        breadth: 265,
        height: 75,
        quantity: 150,
        availableQuantity: 110,
        totalQuantity: 150,
        companyName: 'TechSafe Packaging',
        createdBy: mikeUser._id
      },
      {
        name: 'Clothing Carton - Large',
        length: 345,
        breadth: 255,
        height: 145,
        quantity: 200,
        availableQuantity: 165,
        totalQuantity: 200,
        companyName: 'FashionBox Ltd',
        createdBy: adminUser._id
      },
      {
        name: 'Wine Bottle Carton',
        length: 92,
        breadth: 88,
        height: 318,
        quantity: 300,
        availableQuantity: 275,
        totalQuantity: 300,
        companyName: 'VinoPack Specialists',
        createdBy: johnUser._id
      },
      {
        name: 'Pizza Carton - Medium',
        length: 315,
        breadth: 325,
        height: 38,
        quantity: 500,
        availableQuantity: 420,
        totalQuantity: 500,
        companyName: 'FoodBox Solutions',
        createdBy: sarahUser._id
      },
      {
        name: 'Jewelry Carton - Premium',
        length: 98,
        breadth: 82,
        height: 58,
        quantity: 400,
        availableQuantity: 280,
        totalQuantity: 400,
        companyName: 'LuxuryJewel Packaging',
        createdBy: mikeUser._id
      },
      {
        name: 'Food Container Carton',
        length: 195,
        breadth: 145,
        height: 78,
        quantity: 350,
        availableQuantity: 280,
        totalQuantity: 350,
        companyName: 'FoodSafe Packaging',
        createdBy: emilyUser._id
      },
      {
        name: 'Perfume Carton - Luxury',
        length: 78,
        breadth: 58,
        height: 118,
        quantity: 250,
        availableQuantity: 200,
        totalQuantity: 250,
        companyName: 'FragranceBox Elite',
        createdBy: adminUser._id
      },
      {
        name: 'Tablet Carton',
        length: 275,
        breadth: 195,
        height: 22,
        quantity: 180,
        availableQuantity: 140,
        totalQuantity: 180,
        companyName: 'TabletPack Pro',
        createdBy: johnUser._id
      }
    ]);

    // Create realistic assignments with varied dates
    console.log('📋 Creating assignments...');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const getRandomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    const assignmentData = [
      // Recent assignments (last 7 days) - higher activity
      {
        dimensionSets: [
          { dielineId: dielines[0]._id, dimensionIndex: 0, length: 150, breadth: 100, height: 50, ups: 1, sheets: 50 },
          { dielineId: dielines[0]._id, dimensionIndex: 1, length: 140, breadth: 95, height: 45, ups: 2, sheets: 25 }
        ],
        totalSheets: 75,
        assignedBy: johnUser._id,
        assignedAt: getRandomDate(sevenDaysAgo, now)
      },
      {
        dimensionSets: [
          { dielineId: dielines[1]._id, dimensionIndex: 0, length: 180, breadth: 90, height: 25, ups: 4, sheets: 100 }
        ],
        totalSheets: 100,
        assignedBy: sarahUser._id,
        assignedAt: getRandomDate(sevenDaysAgo, now)
      },
      {
        dimensionSets: [
          { dielineId: dielines[2]._id, dimensionIndex: 0, length: 120, breadth: 40, height: 40, ups: 6, sheets: 80 },
          { dielineId: dielines[2]._id, dimensionIndex: 1, length: 110, breadth: 38, height: 35, ups: 8, sheets: 40 }
        ],
        totalSheets: 120,
        assignedBy: mikeUser._id,
        assignedAt: getRandomDate(sevenDaysAgo, now)
      },
      {
        dimensionSets: [
          { dielineId: dielines[14]._id, dimensionIndex: 0, length: 275, breadth: 195, height: 22, ups: 2, sheets: 60 }
        ],
        totalSheets: 60,
        assignedBy: emilyUser._id,
        assignedAt: getRandomDate(yesterday, now)
      },
      {
        dimensionSets: [
          { dielineId: dielines[13]._id, dimensionIndex: 0, length: 78, breadth: 58, height: 118, ups: 6, sheets: 90 }
        ],
        totalSheets: 90,
        assignedBy: adminUser._id,
        assignedAt: getRandomDate(yesterday, now)
      },

      // Medium-term assignments (7-21 days ago)
      {
        dimensionSets: [
          { dielineId: dielines[3]._id, dimensionIndex: 0, length: 250, breadth: 200, height: 100, ups: 1, sheets: 30 }
        ],
        totalSheets: 30,
        assignedBy: adminUser._id,
        assignedAt: getRandomDate(new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), sevenDaysAgo)
      },
      {
        dimensionSets: [
          { dielineId: dielines[4]._id, dimensionIndex: 0, length: 330, breadth: 200, height: 120, ups: 1, sheets: 60 },
          { dielineId: dielines[4]._id, dimensionIndex: 1, length: 310, breadth: 190, height: 110, ups: 2, sheets: 30 }
        ],
        totalSheets: 90,
        assignedBy: johnUser._id,
        assignedAt: getRandomDate(new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), sevenDaysAgo)
      },
      {
        dimensionSets: [
          { dielineId: dielines[5]._id, dimensionIndex: 0, length: 240, breadth: 170, height: 30, ups: 3, sheets: 150 }
        ],
        totalSheets: 150,
        assignedBy: sarahUser._id,
        assignedAt: getRandomDate(new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), sevenDaysAgo)
      },
      {
        dimensionSets: [
          { dielineId: dielines[12]._id, dimensionIndex: 0, length: 195, breadth: 145, height: 78, ups: 2, sheets: 70 }
        ],
        totalSheets: 70,
        assignedBy: emilyUser._id,
        assignedAt: getRandomDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), sevenDaysAgo)
      },

      // Older assignments (21-30 days ago)
      {
        dimensionSets: [
          { dielineId: dielines[6]._id, dimensionIndex: 0, length: 400, breadth: 300, height: 200, ups: 1, sheets: 20 }
        ],
        totalSheets: 20,
        assignedBy: mikeUser._id,
        assignedAt: getRandomDate(thirtyDaysAgo, new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000))
      },
      {
        dimensionSets: [
          { dielineId: dielines[7]._id, dimensionIndex: 0, length: 380, breadth: 260, height: 80, ups: 1, sheets: 40 },
          { dielineId: dielines[7]._id, dimensionIndex: 1, length: 360, breadth: 240, height: 70, ups: 2, sheets: 20 }
        ],
        totalSheets: 60,
        assignedBy: adminUser._id,
        assignedAt: getRandomDate(thirtyDaysAgo, new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000))
      },
      {
        dimensionSets: [
          { dielineId: dielines[8]._id, dimensionIndex: 0, length: 350, breadth: 250, height: 150, ups: 1, sheets: 35 }
        ],
        totalSheets: 35,
        assignedBy: johnUser._id,
        assignedAt: getRandomDate(thirtyDaysAgo, new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000))
      },
      {
        dimensionSets: [
          { dielineId: dielines[9]._id, dimensionIndex: 0, length: 90, breadth: 90, height: 320, ups: 1, sheets: 25 }
        ],
        totalSheets: 25,
        assignedBy: sarahUser._id,
        assignedAt: getRandomDate(thirtyDaysAgo, new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000))
      },
      {
        dimensionSets: [
          { dielineId: dielines[10]._id, dimensionIndex: 0, length: 320, breadth: 320, height: 40, ups: 1, sheets: 80 }
        ],
        totalSheets: 80,
        assignedBy: mikeUser._id,
        assignedAt: getRandomDate(thirtyDaysAgo, new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000))
      },
      {
        dimensionSets: [
          { dielineId: dielines[11]._id, dimensionIndex: 0, length: 100, breadth: 80, height: 60, ups: 4, sheets: 120 },
          { dielineId: dielines[11]._id, dimensionIndex: 1, length: 90, breadth: 75, height: 55, ups: 6, sheets: 80 }
        ],
        totalSheets: 200,
        assignedBy: adminUser._id,
        assignedAt: getRandomDate(thirtyDaysAgo, new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000))
      },

      // Additional recent assignments for better analytics
      {
        dimensionSets: [
          { dielineId: dielines[0]._id, dimensionIndex: 2, length: 160, breadth: 105, height: 55, ups: 1, sheets: 45 }
        ],
        totalSheets: 45,
        assignedBy: emilyUser._id,
        assignedAt: getRandomDate(yesterday, now)
      },
      {
        dimensionSets: [
          { dielineId: dielines[1]._id, dimensionIndex: 1, length: 170, breadth: 85, height: 22, ups: 6, sheets: 120 },
          { dielineId: dielines[1]._id, dimensionIndex: 2, length: 185, breadth: 95, height: 28, ups: 3, sheets: 60 }
        ],
        totalSheets: 180,
        assignedBy: johnUser._id,
        assignedAt: getRandomDate(sevenDaysAgo, now)
      },
      {
        dimensionSets: [
          { dielineId: dielines[2]._id, dimensionIndex: 2, length: 125, breadth: 42, height: 45, ups: 4, sheets: 100 }
        ],
        totalSheets: 100,
        assignedBy: sarahUser._id,
        assignedAt: getRandomDate(sevenDaysAgo, now)
      }
    ];

    await Assignment.insertMany(assignmentData);

    console.log('✅ Advanced seed data created successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📐 Dielines: ${dielines.length}`);
    console.log(`   📦 Cartons: ${cartons.length}`);
    console.log(`   📋 Assignments: ${assignmentData.length}`);
    console.log('');
    console.log('🔐 Login credentials:');
    console.log('   Admin: admin@shelomgraphics.com / password123');
    console.log('   Employee: john.smith@shelomgraphics.com / password123');
    console.log('   Employee: sarah.johnson@shelomgraphics.com / password123');
    console.log('   Employee: mike.wilson@shelomgraphics.com / password123');
    console.log('   Employee: emily.davis@shelomgraphics.com / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdvancedData();
