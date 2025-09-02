import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Carton from '../models/Carton';
import Dieline from '../models/Dieline';
import Assignment from '../models/Assignment';
import connectDB from '../config/database';

// Load environment variables
dotenv.config();

// Seed data arrays
const userData = [
  {
    name: 'Admin User',
    email: 'admin@shelomgraphics.com',
    password: 'admin123',
    role: 'admin' as const
  },
  {
    name: 'John Manager',
    email: 'john@shelomgraphics.com',
    password: 'manager123',
    role: 'admin' as const
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah@shelomgraphics.com',
    password: 'employee123',
    role: 'employee' as const
  },
  {
    name: 'Mike Johnson',
    email: 'mike@shelomgraphics.com',
    password: 'employee123',
    role: 'employee' as const
  },
  {
    name: 'Lisa Chen',
    email: 'lisa@shelomgraphics.com',
    password: 'employee123',
    role: 'employee' as const
  }
];

const cartonData = [
  {
    name: 'Small Box A4',
    length: 210,
    breadth: 297,
    height: 50,
    quantity: 500,
    availableQuantity: 450,
    totalQuantity: 500,
    companyName: 'BoxCorp Ltd'
  },
  {
    name: 'Medium Box Letter',
    length: 300,
    breadth: 400,
    height: 100,
    quantity: 300,
    availableQuantity: 250,
    totalQuantity: 300,
    companyName: 'PackagePro Inc'
  },
  {
    name: 'Large Shipping Box',
    length: 500,
    breadth: 400,
    height: 200,
    quantity: 200,
    availableQuantity: 180,
    totalQuantity: 200,
    companyName: 'MegaBox Solutions'
  },
  {
    name: 'Square Box Medium',
    length: 250,
    breadth: 250,
    height: 150,
    quantity: 400,
    availableQuantity: 320,
    totalQuantity: 400,
    companyName: 'SquarePackaging'
  },
  {
    name: 'Flat Envelope Box',
    length: 350,
    breadth: 250,
    height: 25,
    quantity: 600,
    availableQuantity: 580,
    totalQuantity: 600,
    companyName: 'FlatPack Co'
  },
  {
    name: 'Tall Narrow Box',
    length: 150,
    breadth: 150,
    height: 300,
    quantity: 250,
    availableQuantity: 200,
    totalQuantity: 250,
    companyName: 'TallBox Industries'
  },
  {
    name: 'Wide Display Box',
    length: 600,
    breadth: 300,
    height: 80,
    quantity: 150,
    availableQuantity: 120,
    totalQuantity: 150,
    companyName: 'DisplayPack Ltd'
  },
  {
    name: 'Cube Box Small',
    length: 200,
    breadth: 200,
    height: 200,
    quantity: 350,
    availableQuantity: 300,
    totalQuantity: 350,
    companyName: 'CubePack Solutions'
  },
  {
    name: 'Rectangle Box Long',
    length: 450,
    breadth: 200,
    height: 120,
    quantity: 280,
    availableQuantity: 220,
    totalQuantity: 280,
    companyName: 'LongBox Corp'
  },
  {
    name: 'Mini Gift Box',
    length: 100,
    breadth: 100,
    height: 50,
    quantity: 800,
    availableQuantity: 750,
    totalQuantity: 800,
    companyName: 'GiftBox Specialists'
  },
  // Low stock items
  {
    name: 'Premium Large Box',
    length: 400,
    breadth: 350,
    height: 180,
    quantity: 100,
    availableQuantity: 8,
    totalQuantity: 100,
    companyName: 'Premium Packaging'
  },
  {
    name: 'Specialty Thin Box',
    length: 320,
    breadth: 240,
    height: 30,
    quantity: 200,
    availableQuantity: 15,
    totalQuantity: 200,
    companyName: 'ThinPack Ltd'
  }
];

const dielineData = [
  {
    name: 'Standard Brochure Die',
    input: 'A4 tri-fold brochure with standard margins',
    dimensions: [
      { length: 210, breadth: 297, height: 2, ups: 4 },
      { length: 105, breadth: 297, height: 2, ups: 8 }
    ]
  },
  {
    name: 'Business Card Layout',
    input: 'Standard business card 85x55mm with bleed',
    dimensions: [
      { length: 85, breadth: 55, height: 1, ups: 12 },
      { length: 90, breadth: 60, height: 1, ups: 10 }
    ]
  },
  {
    name: 'Poster Design A3',
    input: 'A3 poster with 3mm bleed all around',
    dimensions: [
      { length: 297, breadth: 420, height: 3, ups: 2 },
      { length: 303, breadth: 426, height: 3, ups: 1 }
    ]
  },
  {
    name: 'Flyer Design A5',
    input: 'A5 flyer double-sided with coating',
    dimensions: [
      { length: 148, breadth: 210, height: 2, ups: 6 },
      { length: 154, breadth: 216, height: 2, ups: 4 }
    ]
  },
  {
    name: 'Booklet Cover',
    input: '16-page booklet cover with spine',
    dimensions: [
      { length: 220, breadth: 300, height: 5, ups: 3 },
      { length: 225, breadth: 305, height: 5, ups: 2 }
    ]
  },
  {
    name: 'Label Sheet Design',
    input: 'Product labels 50x30mm on A4 sheet',
    dimensions: [
      { length: 50, breadth: 30, height: 1, ups: 24 },
      { length: 210, breadth: 297, height: 1, ups: 1 }
    ]
  },
  {
    name: 'Banner Design Wide',
    input: 'Wide banner 2m x 0.8m for events',
    dimensions: [
      { length: 2000, breadth: 800, height: 5, ups: 1 }
    ]
  },
  {
    name: 'Packaging Insert',
    input: 'Product insert for medium boxes',
    dimensions: [
      { length: 280, breadth: 380, height: 3, ups: 2 },
      { length: 140, breadth: 380, height: 3, ups: 4 }
    ]
  },
  {
    name: 'Greeting Card Design',
    input: 'Folded greeting card with envelope',
    dimensions: [
      { length: 150, breadth: 105, height: 2, ups: 8 },
      { length: 300, breadth: 210, height: 2, ups: 4 }
    ]
  },
  {
    name: 'Menu Design Restaurant',
    input: 'Restaurant menu tri-fold design',
    dimensions: [
      { length: 200, breadth: 300, height: 3, ups: 3 },
      { length: 100, breadth: 300, height: 3, ups: 6 }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Assignment.deleteMany({}),
      Carton.deleteMany({}),
      Dieline.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    const users = [];
    for (const user of userData) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({
        ...user,
        password: hashedPassword
      });
      await newUser.save();
      users.push(newUser);
      console.log(`   ✓ Created user: ${user.name} (${user.role})`);
    }

    // Get admin user for creating other entities
    const adminUser = users.find(u => u.role === 'admin');
    if (!adminUser) throw new Error('Admin user not found');

    // Create cartons
    console.log('📦 Creating cartons...');
    const cartons = [];
    for (const carton of cartonData) {
      const newCarton = new Carton({
        ...carton,
        createdBy: adminUser._id
      });
      await newCarton.save();
      cartons.push(newCarton);
      console.log(`   ✓ Created carton: ${carton.name} (${carton.availableQuantity}/${carton.totalQuantity})`);
    }

    // Create dielines
    console.log('📐 Creating dielines...');
    const dielines = [];
    for (const dieline of dielineData) {
      const newDieline = new Dieline({
        ...dieline,
        createdBy: adminUser._id
      });
      await newDieline.save();
      dielines.push(newDieline);
      console.log(`   ✓ Created dieline: ${dieline.name} (${dieline.dimensions.length} dimensions)`);
    }

    // Create assignments with realistic data
    console.log('📋 Creating assignments...');
    const assignments = [];
    
    // Generate assignments for the last 2 hours with different time intervals
    const now = new Date();
    const timeIntervals = [24, 33, 41, 52, 67, 78, 89, 95, 103, 115]; // minutes ago
    
    for (let i = 0; i < 10; i++) {
      const assignmentTime = new Date(now.getTime() - (timeIntervals[i] * 60 * 1000));
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDieline = dielines[Math.floor(Math.random() * dielines.length)];
      const compatibleCartons = cartons.filter(carton => {
        return randomDieline.dimensions.some(dim => {
          const tolerance = 50; // Larger tolerance for more matches
          return Math.abs(carton.length - dim.length) <= tolerance &&
                 Math.abs(carton.breadth - dim.breadth) <= tolerance &&
                 Math.abs(carton.height - dim.height) <= tolerance;
        });
      });

      if (compatibleCartons.length === 0) continue;

      const selectedCarton = compatibleCartons[0];
      const selectedDimension = randomDieline.dimensions[0];
      const sheetsUsed = Math.floor(Math.random() * 50) + 10; // 10-60 sheets
      const quantityUsed = Math.floor(Math.random() * 10) + 1; // 1-10 units

      const assignment = new Assignment({
        dimensionSets: [{
          dielineId: randomDieline._id,
          dimensionIndex: 0,
          length: selectedDimension.length,
          breadth: selectedDimension.breadth,
          height: selectedDimension.height,
          ups: selectedDimension.ups,
          sheets: sheetsUsed
        }],
        cartonIds: [selectedCarton._id],
        cartonUsage: [{
          cartonId: selectedCarton._id,
          quantityUsed: quantityUsed
        }],
        totalSheets: sheetsUsed,
        assignedBy: randomUser._id,
        assignedAt: assignmentTime
      });

      await assignment.save();
      assignments.push(assignment);
      
      // Update carton availability
      selectedCarton.availableQuantity = Math.max(0, selectedCarton.availableQuantity - quantityUsed);
      await selectedCarton.save();
      
      console.log(`   ✓ Created assignment: ${randomDieline.name} → ${selectedCarton.name} (${quantityUsed} units, ${timeIntervals[i]}m ago)`);
    }

    // Create some recent assignments (last 30 minutes)
    console.log('⚡ Creating recent assignments...');
    const recentIntervals = [5, 12, 18, 25, 28]; // minutes ago
    
    for (let i = 0; i < 5; i++) {
      const assignmentTime = new Date(now.getTime() - (recentIntervals[i] * 60 * 1000));
      const adminOrManager = users.filter(u => u.role === 'admin')[Math.floor(Math.random() * 2)];
      const randomDieline = dielines[Math.floor(Math.random() * dielines.length)];
      const availableCartons = cartons.filter(c => c.availableQuantity > 0);
      
      if (availableCartons.length === 0) continue;

      const selectedCarton = availableCartons[Math.floor(Math.random() * availableCartons.length)];
      const selectedDimension = randomDieline.dimensions[0];
      const sheetsUsed = Math.floor(Math.random() * 30) + 5; // 5-35 sheets
      const quantityUsed = Math.min(Math.floor(Math.random() * 5) + 1, selectedCarton.availableQuantity);

      const assignment = new Assignment({
        dimensionSets: [{
          dielineId: randomDieline._id,
          dimensionIndex: 0,
          length: selectedDimension.length,
          breadth: selectedDimension.breadth,
          height: selectedDimension.height,
          ups: selectedDimension.ups,
          sheets: sheetsUsed
        }],
        cartonIds: [selectedCarton._id],
        cartonUsage: [{
          cartonId: selectedCarton._id,
          quantityUsed: quantityUsed
        }],
        totalSheets: sheetsUsed,
        assignedBy: adminOrManager._id,
        assignedAt: assignmentTime
      });

      await assignment.save();
      
      // Update carton availability
      selectedCarton.availableQuantity -= quantityUsed;
      await selectedCarton.save();
      
      console.log(`   ✓ Created recent assignment: ${randomDieline.name} → ${selectedCarton.name} (${quantityUsed} units, ${recentIntervals[i]}m ago)`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📦 Cartons: ${cartons.length}`);
    console.log(`   📐 Dielines: ${dielines.length}`);
    console.log(`   📋 Assignments: ${assignments.length + 5}`);
    console.log(`\n🔐 Login credentials:`);
    console.log(`   Admin: admin@shelomgraphics.com / admin123`);
    console.log(`   Manager: john@shelomgraphics.com / manager123`);
    console.log(`   Employee: sarah@shelomgraphics.com / employee123`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
