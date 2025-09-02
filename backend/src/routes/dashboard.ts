import express, { Request, Response } from 'express';
import Dieline from '../models/Dieline';
import Carton from '../models/Carton';
import Assignment from '../models/Assignment';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req: any, res) => {
  try {
    const totalDielines = await Dieline.countDocuments();
    const totalCartons = await Carton.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalUsers = await User.countDocuments();

    // Low stock cartons (less than 10% of total quantity)
    const lowStockCartons = await Carton.find({
      $expr: {
        $lt: ['$availableQuantity', { $multiply: ['$totalQuantity', 0.1] }]
      }
    }).countDocuments();

    // Recent assignments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAssignments = await Assignment.countDocuments({
      assignedAt: { $gte: sevenDaysAgo }
    });

    // Total quantity in stock
    const cartons = await Carton.find();
    const totalQuantityInStock = cartons.reduce((sum, carton) => sum + carton.availableQuantity, 0);
    const totalQuantityOverall = cartons.reduce((sum, carton) => sum + carton.totalQuantity, 0);

    res.json({
      totalDielines,
      totalCartons,
      totalAssignments,
      totalUsers,
      lowStockCartons,
      recentAssignments,
      totalQuantityInStock,
      totalQuantityOverall
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/recent-activity', authenticate, async (req: any, res) => {
  try {
    const recentAssignments = await Assignment.find()
      .populate('dielineId', 'name')
      .populate('cartonId', 'name')
      .populate('assignedBy', 'name')
      .sort({ assignedAt: -1 })
      .limit(10);

    res.json(recentAssignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock alerts
router.get('/low-stock', authenticate, async (req: any, res) => {
  try {
    const lowStockCartons = await Carton.find({
      $expr: {
        $lt: ['$availableQuantity', { $multiply: ['$totalQuantity', 0.1] }]
      }
    }).populate('createdBy', 'name email');

    res.json(lowStockCartons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;