import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Carton from '../models/Carton';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get all cartons
router.get('/', authenticate, async (req: any, res) => {
  try {
    const cartons = await Carton.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(cartons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single carton
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const carton = await Carton.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!carton) {
      return res.status(404).json({ message: 'Carton not found' });
    }

    res.json(carton);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create carton
router.post('/', [
  authenticate,
  body('name').trim().isLength({ min: 1 }),
  body('length').isNumeric().isFloat({ min: 0 }),
  body('breadth').isNumeric().isFloat({ min: 0 }),
  body('height').isNumeric().isFloat({ min: 0 }),
  body('totalQuantity').isInt({ min: 1 })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, length, breadth, height, totalQuantity } = req.body;

    const carton = new Carton({
      name,
      length: parseFloat(length),
      breadth: parseFloat(breadth),
      height: parseFloat(height),
      totalQuantity: parseInt(totalQuantity),
      availableQuantity: parseInt(totalQuantity),
      createdBy: req.user._id
    });

    await carton.save();
    await carton.populate('createdBy', 'name email');

    res.status(201).json(carton);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update carton
router.put('/:id', [
  authenticate,
  body('name').trim().isLength({ min: 1 }),
  body('length').isNumeric().isFloat({ min: 0 }),
  body('breadth').isNumeric().isFloat({ min: 0 }),
  body('height').isNumeric().isFloat({ min: 0 }),
  body('totalQuantity').isInt({ min: 1 })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, length, breadth, height, totalQuantity } = req.body;
    
    const currentCarton = await Carton.findById(req.params.id);
    if (!currentCarton) {
      return res.status(404).json({ message: 'Carton not found' });
    }

    const usedQuantity = currentCarton.totalQuantity - currentCarton.availableQuantity;
    const newAvailableQuantity = parseInt(totalQuantity) - usedQuantity;

    if (newAvailableQuantity < 0) {
      return res.status(400).json({ 
        message: 'Total quantity cannot be less than used quantity' 
      });
    }

    const carton = await Carton.findByIdAndUpdate(
      req.params.id,
      {
        name,
        length: parseFloat(length),
        breadth: parseFloat(breadth),
        height: parseFloat(height),
        totalQuantity: parseInt(totalQuantity),
        availableQuantity: newAvailableQuantity
      },
      { new: true }
    ).populate('createdBy', 'name email');

    res.json(carton);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete carton
router.delete('/:id', [authenticate, authorize(['admin'])], async (req: Request, res: Response) => {
  try {
    const carton = await Carton.findByIdAndDelete(req.params.id);

    if (!carton) {
      return res.status(404).json({ message: 'Carton not found' });
    }

    res.json({ message: 'Carton deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;