import mongoose, { Schema, Document } from 'mongoose';

export interface ICarton extends Document {
  name: string;
  length: number;
  breadth: number;
  height: number;
  totalQuantity: number;
  availableQuantity: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CartonSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  length: {
    type: Number,
    required: true,
    min: 0
  },
  breadth: {
    type: Number,
    required: true,
    min: 0
  },
  height: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<ICarton>('Carton', CartonSchema);