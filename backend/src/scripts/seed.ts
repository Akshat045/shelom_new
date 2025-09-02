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

const seedData = async () => {
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
      }
    ]);

    const adminUser = users[0];
    const johnUser = users[1];
    const sarahUser = users[2];
    const mikeUser = users[3];

    // Create Dielines with realistic packaging dimensions
    console.log('📐 Creating dielines...');
    const dielines = await Dieline.insertMany([
      // Small product boxes
      {
        name: 'Small Product Box - Electronics',
        length: 150,
        breadth: 100,
        height: 50,
        tolerance: 5,
        createdBy: adminUser._id
      },
      {
        name: 'Phone Case Package',
        length: 180,
        breadth: 90,
        height: 25,
        tolerance: 3,
        createdBy: johnUser._id
      },
      {
        name: 'Cosmetic Box - Lipstick',
        length: 120,
        breadth: 40,
        height: 40,
        tolerance: 2,
        createdBy: sarahUser._id
      },

      // Medium product boxes
      {
        name: 'Medium Gift Box',
        length: 250,
        breadth: 200,
        height: 100,
        tolerance: 8,
        createdBy: adminUser._id
      },
      {
        name: 'Shoe Box - Standard',
        length: 330,
        breadth: 200,
        height: 120,
        tolerance: 10,
        createdBy: mikeUser._id
      },
      {
        name: 'Book Packaging',
        length: 240,
        breadth: 170,
        height: 30,
        tolerance: 5,
        createdBy: johnUser._id
      },

      // Large product boxes
      {
        name: 'Large Shipping Box',
        length: 400,
        breadth: 300,
        height: 200,
        tolerance: 15,
        createdBy: adminUser._id
      },
      {
        name: 'Laptop Box',
        length: 380,
        breadth: 260,
        height: 80,
        tolerance: 12,
        createdBy: sarahUser._id
      },
      {
        name: 'Clothing Box - Large',
        length: 350,
        breadth: 250,
        height: 150,
        tolerance: 10,
        createdBy: mikeUser._id
      },

      // Specialty boxes
      {
        name: 'Wine Bottle Box',
        length: 90,
        breadth: 90,
        height: 320,
        tolerance: 5,
        createdBy: johnUser._id
      },
      {
        name: 'Pizza Box - Medium',
        length: 320,
        breadth: 320,
        height: 40,
        tolerance: 8,
        createdBy: adminUser._id
      },
      {
        name: 'Jewelry Box - Premium',
        length: 100,
        breadth: 80,
        height: 60,
        tolerance: 2,
        createdBy: sarahUser._id
      }
    ]);

    // Create Cartons with compatible and some incompatible dimensions
    console.log('📦 Creating cartons...');
    const cartons = await Carton.insertMany([
      // Compatible with Small Product Box - Electronics (150x100x50, tolerance 5)
      {
        name: 'Small Electronics Carton A',
        length: 148,
        breadth: 102,
        height: 52,
        totalQuantity: 500,
        availableQuantity: 450,
        createdBy: adminUser._id
      },
      {
        name: 'Small Electronics Carton B',
        length: 152,
        breadth: 98,
        height: 48,
        totalQuantity: 300,
        availableQuantity: 280,
        createdBy: johnUser._id
      },

      // Compatible with Phone Case Package (180x90x25, tolerance 3)
      {
        name: 'Phone Case Carton',
        length: 182,
        breadth: 88,
        height: 27,
        totalQuantity: 1000,
        availableQuantity: 850,
        createdBy: sarahUser._id
      },

      // Compatible with Cosmetic Box - Lipstick (120x40x40, tolerance 2)
      {
        name: 'Cosmetic Carton - Small',
        length: 118,
        breadth: 42,
        height: 38,
        totalQuantity: 800,
        availableQuantity: 720,
        createdBy: mikeUser._id
      },

      // Compatible with Medium Gift Box (250x200x100, tolerance 8)
      {
        name: 'Medium Gift Carton A',
        length: 245,
        breadth: 205,
        height: 95,
        totalQuantity: 200,
        availableQuantity: 180,
        createdBy: adminUser._id
      },
      {
        name: 'Medium Gift Carton B',
        length: 255,
        breadth: 195,
        height: 105,
        totalQuantity: 150,
        availableQuantity: 120,
        createdBy: johnUser._id
      },

      // Compatible with Shoe Box - Standard (330x200x120, tolerance 10)
      {
        name: 'Shoe Carton - Standard',
        length: 325,
        breadth: 205,
        height: 115,
        totalQuantity: 400,
        availableQuantity: 350,
        createdBy: sarahUser._id
      },
      {
        name: 'Shoe Carton - Premium',
        length: 335,
        breadth: 195,
        height: 125,
        totalQuantity: 250,
        availableQuantity: 200,
        createdBy: mikeUser._id
      },

      // Compatible with Book Packaging (240x170x30, tolerance 5)
      {
        name: 'Book Carton',
        length: 238,
        breadth: 172,
        height: 32,
        totalQuantity: 600,
        availableQuantity: 550,
        createdBy: adminUser._id
      },

      // Compatible with Large Shipping Box (400x300x200, tolerance 15)
      {
        name: 'Large Shipping Carton A',
        length: 390,
        breadth: 310,
        height: 190,
        totalQuantity: 100,
        availableQuantity: 85,
        createdBy: johnUser._id
      },
      {
        name: 'Large Shipping Carton B',
        length: 410,
        breadth: 290,
        height: 210,
        totalQuantity: 80,
        availableQuantity: 70,
        createdBy: sarahUser._id
      },

      // Compatible with Laptop Box (380x260x80, tolerance 12)
      {
        name: 'Laptop Carton',
        length: 375,
        breadth: 265,
        height: 75,
        totalQuantity: 150,
        availableQuantity: 130,
        createdBy: mikeUser._id
      },

      // Compatible with Clothing Box - Large (350x250x150, tolerance 10)
      {
        name: 'Clothing Carton - Large',
        length: 345,
        breadth: 255,
        height: 145,
        totalQuantity: 200,
        availableQuantity: 170,
        createdBy: adminUser._id
      },

      // Compatible with Wine Bottle Box (90x90x320, tolerance 5)
      {
        name: 'Wine Bottle Carton',
        length: 92,
        breadth: 88,
        height: 318,
        totalQuantity: 300,
        availableQuantity: 250,
        createdBy: johnUser._id
      },

      // Compatible with Pizza Box - Medium (320x320x40, tolerance 8)
      {
        name: 'Pizza Carton - Medium',
        length: 315,
        breadth: 325,
        height: 38,
        totalQuantity: 500,
        availableQuantity: 420,
        createdBy: sarahUser._id
      },

      // Compatible with Jewelry Box - Premium (100x80x60, tolerance 2)
      {
        name: 'Jewelry Carton - Premium',
        length: 98,
        breadth: 82,
        height: 58,
        totalQuantity: 400,
        availableQuantity: 380,
        createdBy: mikeUser._id
      },

      // Some cartons with low stock for alerts
      {
        name: 'Emergency Stock Carton',
        length: 200,
        breadth: 150,
        height: 100,
        totalQuantity: 50,
        availableQuantity: 5, // Very low stock
        createdBy: adminUser._id
      },
      {
        name: 'Limited Edition Carton',
        length: 180,
        breadth: 120,
        height: 80,
        totalQuantity: 100,
        availableQuantity: 15, // Low stock
        createdBy: johnUser._id
      }
    ]);

    // Create realistic assignments
    console.log('📋 Creating assignments...');
    const assignments = [];

    // Create assignments with realistic dates over the past 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Helper function to get random date between two dates
    const getRandomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Create assignments for compatible dieline-carton pairs (balanced across users)
    const assignmentData = [
      // User 1 (John Smith) - 8 assignments
      { dielineIndex: 0, cartonIndex: 0, quantity: 50, userIndex: 1 },
      { dielineIndex: 2, cartonIndex: 3, quantity: 40, userIndex: 1 },
      { dielineIndex: 4, cartonIndex: 6, quantity: 45, userIndex: 1 },
      { dielineIndex: 6, cartonIndex: 9, quantity: 15, userIndex: 1 },
      { dielineIndex: 8, cartonIndex: 12, quantity: 30, userIndex: 1 },
      { dielineIndex: 9, cartonIndex: 13, quantity: 25, userIndex: 1 },
      { dielineIndex: 11, cartonIndex: 15, quantity: 20, userIndex: 1 },
      { dielineIndex: 1, cartonIndex: 2, quantity: 75, userIndex: 1 },

      // User 2 (Sarah Johnson) - 8 assignments  
      { dielineIndex: 0, cartonIndex: 1, quantity: 35, userIndex: 2 },
      { dielineIndex: 3, cartonIndex: 4, quantity: 20, userIndex: 2 },
      { dielineIndex: 4, cartonIndex: 7, quantity: 40, userIndex: 2 },
      { dielineIndex: 5, cartonIndex: 8, quantity: 50, userIndex: 2 },
      { dielineIndex: 6, cartonIndex: 10, quantity: 10, userIndex: 2 },
      { dielineIndex: 7, cartonIndex: 11, quantity: 25, userIndex: 2 },
      { dielineIndex: 10, cartonIndex: 14, quantity: 60, userIndex: 2 },
      { dielineIndex: 2, cartonIndex: 3, quantity: 30, userIndex: 2 },

      // User 3 (Mike Wilson) - 8 assignments
      { dielineIndex: 1, cartonIndex: 2, quantity: 80, userIndex: 3 },
      { dielineIndex: 3, cartonIndex: 5, quantity: 30, userIndex: 3 },
      { dielineIndex: 5, cartonIndex: 8, quantity: 40, userIndex: 3 },
      { dielineIndex: 7, cartonIndex: 11, quantity: 20, userIndex: 3 },
      { dielineIndex: 8, cartonIndex: 12, quantity: 25, userIndex: 3 },
      { dielineIndex: 9, cartonIndex: 13, quantity: 35, userIndex: 3 },
      { dielineIndex: 10, cartonIndex: 14, quantity: 50, userIndex: 3 },
      { dielineIndex: 11, cartonIndex: 15, quantity: 15, userIndex: 3 }
    ];

    for (const assignment of assignmentData) {
      assignments.push({
        dielineId: dielines[assignment.dielineIndex]._id,
        cartonId: cartons[assignment.cartonIndex]._id,
        quantityUsed: assignment.quantity,
        assignedBy: users[assignment.userIndex]._id,
        assignedAt: getRandomDate(thirtyDaysAgo, now)
      });
    }

    await Assignment.insertMany(assignments);

    console.log('✅ Seed data created successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📐 Dielines: ${dielines.length}`);
    console.log(`   📦 Cartons: ${cartons.length}`);
    console.log(`   📋 Assignments: ${assignments.length}`);
    console.log('');
    console.log('🔐 Login credentials:');
    console.log('   Admin: admin@shelomgraphics.com / password123');
    console.log('   Employee: john.smith@shelomgraphics.com / password123');
    console.log('   Employee: sarah.johnson@shelomgraphics.com / password123');
    console.log('   Employee: mike.wilson@shelomgraphics.com / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();