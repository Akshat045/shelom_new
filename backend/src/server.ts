import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import User from './models/User';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dielineRoutes from './routes/dielines';
import cartonRoutes from './routes/cartons';
import assignmentRoutes from './routes/assignments';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dielines', dielineRoutes);
app.use('/api/cartons', cartonRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@inventory.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@inventory.com',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin'
      });
      await admin.save();
      console.log('Default admin user created: admin@inventory.com / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Default admin creation disabled - use seed script instead
  // createDefaultAdmin();
});