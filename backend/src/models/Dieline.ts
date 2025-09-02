import mongoose, { Schema, Document } from 'mongoose';

export interface IDieline extends Document {
  name: string;
  length: number;
  breadth: number;
  height: number;
  tolerance: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DielineSchema: Schema = new Schema({
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
  tolerance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
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

export default mongoose.model<IDieline>('Dieline', DielineSchema);