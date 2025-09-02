import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Carton from '../models/Carton';
import Dieline from '../models/Dieline';
import Assignment from '../models/Assignment';

// Load environment variables
dotenv.config();

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    console.log('🗑️  Clearing all data from database...');
    
    // Clear all collections
    const userCount = await User.countDocuments();
    const cartonCount = await Carton.countDocuments();
    const dielineCount = await Dieline.countDocuments();
    const assignmentCount = await Assignment.countDocuments();

    await User.deleteMany({});
    await Carton.deleteMany({});
    await Dieline.deleteMany({});
    await Assignment.deleteMany({});

    console.log('\n✅ Database reset completed!');
    console.log('\n📊 Removed:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`📦 Cartons: ${cartonCount}`);
    console.log(`📐 Dielines: ${dielineCount}`);
    console.log(`🔗 Assignments: ${assignmentCount}`);
    console.log(`\n🎯 Total records removed: ${userCount + cartonCount + dielineCount + assignmentCount}`);

  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the reset function
resetDatabase();