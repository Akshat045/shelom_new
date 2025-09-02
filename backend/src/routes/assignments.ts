import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Assignment from '../models/Assignment';
import Dieline from '../models/Dieline';
import Carton from '../models/Carton';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get all assignments
router.get('/', authenticate, async (req: any, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('dielineId', 'name length breadth height tolerance')
      .populate('cartonId', 'name length breadth height')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get compatible cartons for a dieline
router.get('/compatible/:dielineId', authenticate, async (req: Request, res: Response) => {
  try {
    const dieline = await Dieline.findById(req.params.dielineId);
    if (!dieline) {
      return res.status(404).json({ message: 'Dieline not found' });
    }

    const cartons = await Carton.find({ availableQuantity: { $gt: 0 } })
      .populate('createdBy', 'name email');

    const compatibleCartons = cartons.filter(carton => {
      const lengthDiff = Math.abs(carton.length - dieline.length);
      const breadthDiff = Math.abs(carton.breadth - dieline.breadth);
      const heightDiff = Math.abs(carton.height - dieline.height);

      return lengthDiff <= dieline.tolerance &&
             breadthDiff <= dieline.tolerance &&
             heightDiff <= dieline.tolerance;
    });

    res.json(compatibleCartons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment
router.post('/', [
  authenticate,
  body('dielineId').isMongoId(),
  body('cartonId').isMongoId(),
  body('quantityUsed').isInt({ min: 1 })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dielineId, cartonId, quantityUsed } = req.body;

    // Check if dieline exists
    const dieline = await Dieline.findById(dielineId);
    if (!dieline) {
      return res.status(404).json({ message: 'Dieline not found' });
    }

    // Check if carton exists and has enough quantity
    const carton = await Carton.findById(cartonId);
    if (!carton) {
      return res.status(404).json({ message: 'Carton not found' });
    }

    if (carton.availableQuantity < quantityUsed) {
      return res.status(400).json({ 
        message: `Not enough quantity available. Available: ${carton.availableQuantity}` 
      });
    }

    // Check compatibility
    const lengthDiff = Math.abs(carton.length - dieline.length);
    const breadthDiff = Math.abs(carton.breadth - dieline.breadth);
    const heightDiff = Math.abs(carton.height - dieline.height);

    if (lengthDiff > dieline.tolerance ||
        breadthDiff > dieline.tolerance ||
        heightDiff > dieline.tolerance) {
      return res.status(400).json({ 
        message: 'Carton dimensions are not compatible with dieline tolerance' 
      });
    }

    // Create assignment
    const assignment = new Assignment({
      dielineId,
      cartonId,
      quantityUsed: parseInt(quantityUsed),
      assignedBy: req.user._id
    });

    await assignment.save();

    // Update carton available quantity
    carton.availableQuantity -= parseInt(quantityUsed);
    await carton.save();

    // Populate assignment for response
    await assignment.populate([
      { path: 'dielineId', select: 'name length breadth height tolerance' },
      { path: 'cartonId', select: 'name length breadth height' },
      { path: 'assignedBy', select: 'name email' }
    ]);

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignments by user (for employee dashboard)
router.get('/my-assignments', authenticate, async (req: any, res) => {
  try {
    const assignments = await Assignment.find({ assignedBy: req.user._id })
      .populate('dielineId', 'name length breadth height tolerance')
      .populate('cartonId', 'name length breadth height')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;