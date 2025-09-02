'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Dieline, Carton, Assignment } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface DimensionSet {
  dielineId: string;
  dielineName: string;
  dimensionIndex: number;
  length: number;
  breadth: number;
  height: number;
  ups: number;
  sheets: number;
  selected: boolean;
}

interface CartonUsage {
  cartonId: string;
  quantityUsed: number;
}

interface AssignmentForm {
  cartonId: string;
  dielineIds: string[];
  dimensionSets: DimensionSet[];
  cartonUsage: CartonUsage[];
  totalSheets: number;
}

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [dielines, setDielines] = useState<Dieline[]>([]);
  const [cartons, setCartons] = useState<Carton[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDielines, setSelectedDielines] = useState<Dieline[]>([]);
  const [dimensionSets, setDimensionSets] = useState<DimensionSet[]>([]);
  const [selectedDielineIds, setSelectedDielineIds] = useState<string[]>([]);
  const [selectedCartonIds, setSelectedCartonIds] = useState<string[]>([]);
  const [cartonUsage, setCartonUsage] = useState<CartonUsage[]>([]);
  const [dielineSearchTerm, setDielineSearchTerm] = useState('');
  const itemsPerPage = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignmentForm>();

  useEffect(() => {
    fetchData();
  }, []);

  // Handle dieline selection changes
  const handleDielineChange = useCallback((dielineId: string, checked: boolean) => {
    setSelectedDielineIds(prev => {
      const newIds = checked 
        ? [...prev, dielineId]
        : prev.filter(id => id !== dielineId);
      return newIds;
    });
  }, []);

  // Handle carton selection changes
  const handleCartonChange = useCallback((cartonId: string, checked: boolean) => {
    setSelectedCartonIds(prev => {
      const newIds = checked 
        ? [...prev, cartonId]
        : prev.filter(id => id !== cartonId);
      return newIds;
    });

    // Update carton usage when selection changes
    setCartonUsage(prev => {
      if (checked) {
        // Add new carton usage entry
        return [...prev, { cartonId, quantityUsed: 1 }];
      } else {
        // Remove carton usage entry
        return prev.filter(usage => usage.cartonId !== cartonId);
      }
    });
  }, []);

  // Update carton quantity used
  const updateCartonQuantity = (cartonId: string, quantity: number) => {
    const carton = cartons.find(c => c._id === cartonId);
    const availableQty = carton?.availableQuantity || carton?.quantity || 0;
    
    if (quantity > availableQty) {
      toast.error(`${carton?.name}: Only ${availableQty} units available`);
      return;
    }

    setCartonUsage(prev => 
      prev.map(usage => 
        usage.cartonId === cartonId 
          ? { ...usage, quantityUsed: Math.max(1, quantity) }
          : usage
      )
    );
  };

  // Update dimension sets when selected dielines change
  useEffect(() => {
    if (selectedDielineIds.length > 0 && dielines.length > 0) {
      const selectedDielineObjects = dielines.filter(d => selectedDielineIds.includes(d._id));
      setSelectedDielines(selectedDielineObjects);
      
      const newDimensionSets: DimensionSet[] = [];
      selectedDielineObjects.forEach(dieline => {
        if (dieline.dimensions) {
          dieline.dimensions.forEach((dimension, index) => {
            newDimensionSets.push({
              dielineId: dieline._id,
              dielineName: dieline.name,
              dimensionIndex: index,
              length: dimension.length,
              breadth: dimension.breadth,
              height: dimension.height,
              ups: dimension.ups,
              sheets: 0,
              selected: false
            });
          });
        }
      });
      setDimensionSets(newDimensionSets);
    } else {
      setDimensionSets([]);
      setSelectedDielines([]);
    }
  }, [selectedDielineIds, dielines]);

  const fetchData = async () => {
    try {
      const [assignmentsRes, dielinesRes, cartonsRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/dielines'),
        api.get('/cartons'),
      ]);
      setAssignments(assignmentsRes.data);
      setDielines(dielinesRes.data);
      setCartons(cartonsRes.data.cartons || cartonsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateDimensionSet = (index: number, field: keyof DimensionSet, value: any) => {
    const newSets = [...dimensionSets];
    newSets[index] = { ...newSets[index], [field]: value };
    setDimensionSets(newSets);
  };

  const calculateTotalSheets = () => {
    return dimensionSets
      .filter(set => set.selected)
      .reduce((total, set) => total + set.sheets, 0);
  };

  // Function to filter dielines based on search term
  const getFilteredDielines = () => {
    if (!dielineSearchTerm.trim()) return dielines;
    return dielines.filter(dieline => 
      dieline.name.toLowerCase().includes(dielineSearchTerm.toLowerCase())
    );
  };

  // Function to find compatible cartons for selected dielines
  const getCompatibleCartons = () => {
    // Ensure cartons array exists and is valid
    if (!cartons || !Array.isArray(cartons)) return [];
    
    // First filter out cartons with zero availability
    const availableCartons = cartons.filter(carton => {
      const availableQty = carton.availableQuantity || carton.quantity || 0;
      return availableQty > 0;
    });
    
    if (selectedDielines.length === 0) return availableCartons;
    
    const tolerance = 5; // ±5mm tolerance
    
    return availableCartons.filter(carton => {
      return selectedDielines.some(dieline => {
        // Ensure dieline has dimensions array
        if (!dieline.dimensions || !Array.isArray(dieline.dimensions)) return false;
        return dieline.dimensions.some(dimension => {
          // Carton can be within ±5mm of dieline dimensions
          const lengthFit = Math.abs(carton.length - dimension.length) <= tolerance;
          const breadthFit = Math.abs(carton.breadth - dimension.breadth) <= tolerance;
          const heightFit = Math.abs(carton.height - dimension.height) <= tolerance;
          return lengthFit && breadthFit && heightFit;
        });
      });
    });
  };

  const onSubmit = async () => {
    try {
      const selectedSets = dimensionSets.filter(set => set.selected && set.sheets > 0);
      if (selectedSets.length === 0) {
        toast.error('Please select at least one dimension set with sheet quantity');
        return;
      }

      if (selectedDielineIds.length === 0) {
        toast.error('Please select at least one dieline');
        return;
      }

      if (selectedCartonIds.length === 0) {
        toast.error('Please select at least one carton');
        return;
      }

      // Check if any selected cartons have zero availability
      const unavailableCartons = cartonUsage.filter(usage => {
        const carton = cartons.find(c => c._id === usage.cartonId);
        const availableQty = carton?.availableQuantity || carton?.quantity || 0;
        return availableQty <= 0;
      });

      if (unavailableCartons.length > 0) {
        toast.error('Cannot create assignment: Some selected cartons are out of stock');
        return;
      }

      // Fetch fresh carton data before submission to ensure accuracy
      toast.loading('Validating carton quantities...');
      const freshCartonsRes = await api.get('/cartons');
      const freshCartons = freshCartonsRes.data.cartons || freshCartonsRes.data;
      
      // Validate carton quantities with fresh data
      const validationErrors = [];
      for (const usage of cartonUsage) {
        const carton = freshCartons.find((c: any) => c._id === usage.cartonId);
        if (!carton) {
          validationErrors.push(`Carton not found`);
          continue;
        }
        
        const availableQty = carton.availableQuantity || carton.quantity || 0;
        if (usage.quantityUsed > availableQty) {
          validationErrors.push(`${carton.name}: Requested ${usage.quantityUsed} but only ${availableQty} available`);
        }
      }

      toast.dismiss(); // Remove loading toast

      if (validationErrors.length > 0) {
        toast.error(`Insufficient quantities: ${validationErrors.join(', ')}`);
        // Refresh local carton data
        fetchData();
        return;
      }

      const submitData = {
        cartonIds: selectedCartonIds,
        dielineIds: selectedDielineIds,
        dimensionSets: selectedSets,
        cartonUsage: cartonUsage,
        totalSheets: calculateTotalSheets()
      };

      await api.post('/assignments', submitData);
      toast.success('Assignment created successfully! Carton quantities updated.');
      fetchData();
      
      // Trigger a refresh of cartons data across the app
      window.dispatchEvent(new CustomEvent('cartonQuantityUpdated'));
      setShowForm(false);
      setSelectedDielines([]);
      setDimensionSets([]);
      setSelectedDielineIds([]);
      setSelectedCartonIds([]);
      setCartonUsage([]);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  const exportToExcel = () => {
    const exportData = filteredAssignments.map((assignment) => ({
      Dielines: Array.from(new Set(assignment.dimensionSets.map(set => set.dielineId))).length,
      'Dimension Sets': assignment.dimensionSets?.length || 0,
      'Total Sheets': assignment.totalSheets,
      'Total Pieces': assignment.dimensionSets?.reduce((total, set) => total + (set.sheets * set.ups), 0) || 0,
      'Assigned By': assignment.assignedBy?.name || 'You',
      Date: new Date(assignment.assignedAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');

    const fileName = `assignments_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('File exported successfully');
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const search = searchTerm.toLowerCase();
    return (
      assignment.dimensionSets.some(set => 
        dielines.find(d => d._id === set.dielineId)?.name?.toLowerCase().includes(search)
      ) ||
      assignment.assignedBy?.name?.toLowerCase().includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
          <p className="text-gray-600">Manage carton-dieline assignments</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              disabled={filteredAssignments.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              New Assignment
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Create Assignment</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedDielines([]);
                    setDimensionSets([]);
                    setSelectedDielineIds([]);
                    setSelectedCartonIds([]);
                    setCartonUsage([]);
                    setDielineSearchTerm('');
                    reset();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Dielines
                  </label>
                  
                  {/* Dieline Search Bar */}
                  <div className="relative mb-3">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search dielines by name..."
                      value={dielineSearchTerm}
                      onChange={(e) => setDielineSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {dielineSearchTerm && (
                      <button
                        onClick={() => setDielineSearchTerm('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      >
                        <XMarkIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {getFilteredDielines().length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {dielineSearchTerm ? `No dielines found matching "${dielineSearchTerm}"` : 'No dielines available'}
                      </div>
                    ) : (
                      getFilteredDielines().map((dieline) => (
                        <label
                          key={dieline._id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDielineIds.includes(dieline._id)}
                            onChange={(e) => handleDielineChange(dieline._id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{dieline.name}</p>
                            <p className="text-sm text-gray-600">
                              {dieline.dimensions.length} dimension{dieline.dimensions.length > 1 ? 's' : ''} available
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {errors.dielineIds && (
                    <p className="text-red-500 text-sm mt-1">{errors.dielineIds.message}</p>
                  )}
                </div>

                {/* Dimension Sets Selection */}
                {selectedDielines.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Dimension Sets & Sheet Quantities
                    </label>
                    <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {dimensionSets.map((dimensionSet, index) => (
                        <div key={`${dimensionSet.dielineId}-${dimensionSet.dimensionIndex}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <input
                              type="checkbox"
                              checked={dimensionSet.selected}
                              onChange={(e) => updateDimensionSet(index, 'selected', e.target.checked)}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {dimensionSet.dielineName} - Dimension {dimensionSet.dimensionIndex + 1}
                              </div>
                              <div className="text-sm text-gray-600 font-mono">
                                {dimensionSet.length} × {dimensionSet.breadth} × {dimensionSet.height} mm
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-indigo-600">
                                {dimensionSet.ups} UPS
                              </div>
                            </div>
                          </div>
                          
                          {dimensionSet.selected && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <label className="block text-xs font-medium text-gray-600 mb-2">
                                Sheet Quantity for this dimension
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={dimensionSet.sheets || ''}
                                onChange={(e) => updateDimensionSet(index, 'sheets', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter sheets for this dimension"
                              />
                              <div className="mt-2 text-xs text-gray-500">
                                Total pieces: {(dimensionSet.sheets || 0) * dimensionSet.ups}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Total Summary */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">
                          Total Sheets: {calculateTotalSheets()}
                        </span>
                        <span className="text-sm font-medium text-blue-700">
                          Total Pieces: {dimensionSets
                            .filter(set => set.selected)
                            .reduce((total, set) => total + (set.sheets * set.ups), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Carton Selection - Only show after dielines are selected */}
                {selectedDielines.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Compatible Cartons
                    </label>
                    {getCompatibleCartons().length === 0 ? (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                        ❌ No available cartons found. All compatible cartons are either out of stock or don't fit the selected dielines.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {getCompatibleCartons().map((carton) => {
                          const usage = cartonUsage.find(u => u.cartonId === carton._id);
                          const isSelected = selectedCartonIds.includes(carton._id);
                          
                          return (
                            <div key={carton._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleCartonChange(carton._id, e.target.checked)}
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{carton.name}</p>
                                  <p className="text-sm text-gray-600 font-mono">
                                    {carton.length} × {carton.breadth} × {carton.height} mm
                                  </p>
                                  <p className="text-xs text-green-600">
                                    Available: {carton.availableQuantity || carton.quantity || 0} units
                                  </p>
                                </div>
                              </label>
                              
                              {isSelected && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <label className="block text-xs font-medium text-gray-600 mb-2">
                                    Quantity to use
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={carton.availableQuantity || carton.quantity || 0}
                                    value={usage?.quantityUsed || 1}
                                    onChange={(e) => updateCartonQuantity(carton._id, parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter quantity to use"
                                  />
                                  <div className="mt-1 text-xs text-gray-500">
                                    Max available: {carton.availableQuantity || carton.quantity || 0} units
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {getCompatibleCartons().length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          ✅ {selectedCartonIds.length} of {getCompatibleCartons().length} compatible cartons selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={selectedDielineIds.length === 0 || calculateTotalSheets() === 0 || selectedCartonIds.length === 0}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Create Assignment ({calculateTotalSheets()} sheets)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedDielines([]);
                      setDimensionSets([]);
                      setSelectedDielineIds([]);
                      setSelectedCartonIds([]);
                      setCartonUsage([]);
                      setDielineSearchTerm('');
                      reset();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assignments Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Assignments ({filteredAssignments.length})
            </h2>
            {filteredAssignments.length > 0 && (
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredAssignments.length)} of {filteredAssignments.length}
              </p>
            )}
          </div>

          {filteredAssignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dieline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dimension Sets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cartons Used
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Total Sheets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assigned By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedAssignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {/* Get unique dielines from dimension sets */}
                          {Array.from(new Set(assignment.dimensionSets.map(set => set.dielineId))).map(dielineId => {
                            const dieline = dielines.find(d => d._id === dielineId);
                            return (
                              <div key={dielineId} className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {dieline?.name || 'Unknown Dieline'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {assignment.dimensionSets.map((set, index) => (
                            <div key={`${set.dielineId}-${set.dimensionIndex || index}`} className="text-sm">
                              <span className="font-medium text-gray-900">
                                {set.length} × {set.breadth} × {set.height} mm
                              </span>
                              <span className="text-gray-500 ml-2">
                                ({set.sheets} sheets, {set.ups} UPS)
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {assignment.cartonUsage?.map((usage, index) => {
                            const carton = cartons.find(c => c._id === usage.cartonId);
                            return (
                              <div key={`${usage.cartonId}-${index}`} className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {carton?.name || 'Unknown Carton'}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  ({usage.quantityUsed} units)
                                </span>
                              </div>
                            );
                          }) || (
                            <div className="text-sm text-gray-500">
                              No carton data
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {assignment.totalSheets}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {assignment.dimensionSets.reduce((total, set) => total + (set.sheets * set.ups), 0)} pieces
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{assignment.assignedBy?.name || 'You'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(assignment.assignedAt).toLocaleTimeString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              {searchTerm ? (
                <div>
                  <p className="text-gray-500 mb-2">
                    No assignments found for &quot;{searchTerm}&quot;
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-4">No assignments yet</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create First Assignment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200/60 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/60 
                             rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-white 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span className="font-medium">Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : 'bg-white/70 backdrop-blur-sm border border-slate-200/60 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-white shadow-sm hover:shadow-md'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/60 
                             rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-white 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="font-medium">Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AssignmentsPage;
