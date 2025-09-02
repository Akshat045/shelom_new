import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Dieline from '../models/Dieline';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get all dielines
router.get('/', authenticate, async (req: any, res) => {
  try {
    const dielines = await Dieline.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(dielines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single dieline
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const dieline = await Dieline.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!dieline) {
      return res.status(404).json({ message: 'Dieline not found' });
    }

    res.json(dieline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create dieline
router.post('/', [
  authenticate,
  body('name').trim().isLength({ min: 1 }),
  body('length').isNumeric().isFloat({ min: 0 }),
  body('breadth').isNumeric().isFloat({ min: 0 }),
  body('height').isNumeric().isFloat({ min: 0 }),
  body('tolerance').isNumeric().isFloat({ min: 0, max: 100 })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, length, breadth, height, tolerance } = req.body;

    const dieline = new Dieline({
      name,
      length: parseFloat(length),
      breadth: parseFloat(breadth),
      height: parseFloat(height),
      tolerance: parseFloat(tolerance),
      createdBy: req.user._id
    });

    await dieline.save();
    await dieline.populate('createdBy', 'name email');

    res.status(201).json(dieline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update dieline
router.put('/:id', [
  authenticate,
  authorize(['admin']),
  body('name').trim().isLength({ min: 1 }),
  body('length').isNumeric().isFloat({ min: 0 }),
  body('breadth').isNumeric().isFloat({ min: 0 }),
  body('height').isNumeric().isFloat({ min: 0 }),
  body('tolerance').isNumeric().isFloat({ min: 0, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, length, breadth, height, tolerance } = req.body;

    const dieline = await Dieline.findByIdAndUpdate(
      req.params.id,
      {
        name,
        length: parseFloat(length),
        breadth: parseFloat(breadth),
        height: parseFloat(height),
        tolerance: parseFloat(tolerance)
      },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!dieline) {
      return res.status(404).json({ message: 'Dieline not found' });
    }

    res.json(dieline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete dieline
router.delete('/:id', [authenticate, authorize(['admin'])], async (req: Request, res: Response) => {
  try {
    const dieline = await Dieline.findByIdAndDelete(req.params.id);

    if (!dieline) {
      return res.status(404).json({ message: 'Dieline not found' });
    }

    res.json({ message: 'Dieline deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;