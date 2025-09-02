export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
}

export interface Dimension {
  length: number;
  breadth: number;
  height: number;
  ups: number;
}

export interface DimensionForm {
  length: number;
  breadth: number;
  height: number;
  ups: number;
}

export interface DielineForm {
  name: string;
  input: string;
  dimensions: DimensionForm[];
}

export interface Dieline {
  _id: string;
  name: string;
  dimensions: Dimension[];
  input: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface Carton {
  _id: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  quantity: number;
  availableQuantity: number;
  totalQuantity: number;
  companyName: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface DimensionSet {
  _id?: string;
  dielineId: string;
  dielineName: string;
  dimensionIndex: number;
  length: number;
  breadth: number;
  height: number;
  ups: number;
  sheets: number;
  selected?: boolean;
}

export interface CartonUsage {
  cartonId: string;
  quantityUsed: number;
}

export interface Assignment {
  _id: string;
  cartonId?: string | Carton;
  dielineId?: string | Dieline;
  dimensionSets: DimensionSet[];
  cartonUsage?: CartonUsage[];
  totalSheets: number;
  quantityUsed: number;
  assignedBy?: User;
  assignedAt: string;
  // Populated dielines for display
  dielines?: Dieline[];
}

export interface DashboardStats {
  totalDielines: number;
  totalCartons: number;
  totalAssignments: number;
  totalUsers: number;
  lowStockCartons: number;
  recentAssignments: number;
  totalQuantityInStock: number;
  totalQuantityOverall: number;
}