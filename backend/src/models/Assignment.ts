import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  dielineId: mongoose.Types.ObjectId;
  cartonId: mongoose.Types.ObjectId;
  quantityUsed: number;
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
}

const AssignmentSchema: Schema = new Schema({
  dielineId: {
    type: Schema.Types.ObjectId,
    ref: 'Dieline',
    required: true
  },
  cartonId: {
    type: Schema.Types.ObjectId,
    ref: 'Carton',
    required: true
  },
  quantityUsed: {
    type: Number,
    required: true,
    min: 1
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);