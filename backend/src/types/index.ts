export interface User {
  _id?: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  name: string;
  createdAt?: Date;
}

export interface Dieline {
  _id?: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  tolerance: number;
  createdBy: string;
  createdAt?: Date;
}

export interface Carton {
  _id?: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  totalQuantity: number;
  availableQuantity: number;
  createdBy: string;
  createdAt?: Date;
}

export interface Assignment {
  _id?: string;
  dielineId: string;
  cartonId: string;
  quantityUsed: number;
  assignedBy: string;
  assignedAt?: Date;
  dieline?: Dieline;
  carton?: Carton;
  user?: User;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}