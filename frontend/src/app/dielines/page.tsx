'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Dieline } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface DimensionForm {
  length: number;
  breadth: number;
  height: number;
  ups: number;
}

interface DielineForm {
  name: string;
  dimensions: DimensionForm[];
}

const DielinesPage: React.FC = () => {
  const { user } = useAuth();
  const [dielines, setDielines] = useState<Dieline[]>([]);
  const [filteredDielines, setFilteredDielines] = useState<Dieline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDieline, setEditingDieline] = useState<Dieline | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dimensions, setDimensions] = useState<DimensionForm[]>([{ length: 0, breadth: 0, height: 0, ups: 1 }]);
  const [importing, setImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'name' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DielineForm>();

  useEffect(() => {
    fetchDielines();
  }, []);

  const fetchDielines = async () => {
    try {
      const response = await api.get('/dielines');
      setDielines(response.data);
      setFilteredDielines(response.data);
    } catch (error) {
      toast.error('Failed to fetch dielines');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search functionality
  useEffect(() => {
    let filtered = [...dielines];

    if (searchTerm) {
      filtered = dielines.filter(dieline => {
        const search = searchTerm.toLowerCase();

        const textMatch = dieline.name.toLowerCase().includes(search) ||
          dieline.createdBy?.name?.toLowerCase().includes(search);

        const dimensionMatches = dieline.dimensions?.some(dim => {
          const dimensionString = `${dim.length}x${dim.breadth}x${dim.height}`;
          return dimensionString.includes(search);
        }) || false;

        const dimensionPattern = /(\d+(?:\.\d+)?)\s*[x*×\s]\s*(\d+(?:\.\d+)?)\s*[x*×\s]\s*(\d+(?:\.\d+)?)/i;
        const dimensionMatch2 = dimensionPattern.test(search);

        if (dimensionMatch2) {
          const match = search.match(dimensionPattern);
          if (match) {
            const [, searchLength, searchBreadth, searchHeight] = match;
            const tolerance = 0.05;

            const targetLength = parseFloat(searchLength);
            const targetBreadth = parseFloat(searchBreadth);
            const targetHeight = parseFloat(searchHeight);

            return dieline.dimensions?.some(dim => {
              const lengthMatch = Math.abs(dim.length - targetLength) <= targetLength * tolerance;
              const breadthMatch = Math.abs(dim.breadth - targetBreadth) <= targetBreadth * tolerance;
              const heightMatch = Math.abs(dim.height - targetHeight) <= targetHeight * tolerance;

              return lengthMatch && breadthMatch && heightMatch;
            }) || false;
          }
        }

        const lengthPattern = /(?:length|l):\s*(\d+(?:\.\d+)?)/i;
        const breadthPattern = /(?:breadth|width|w|b):\s*(\d+(?:\.\d+)?)/i;
        const heightPattern = /(?:height|h):\s*(\d+(?:\.\d+)?)/i;
        const upsPattern = /(?:ups|u):\s*(\d+)/i;

        const lengthMatch = search.match(lengthPattern);
        const breadthMatch = search.match(breadthPattern);
        const heightMatch = search.match(heightPattern);
        const upsMatch = search.match(upsPattern);

        if (lengthMatch || breadthMatch || heightMatch || upsMatch) {
          const tolerance = 0.05;

          return dieline.dimensions?.some(dim => {
            let matches = true;

            if (lengthMatch) {
              const targetLength = parseFloat(lengthMatch[1]);
              matches = matches && Math.abs(dim.length - targetLength) <= targetLength * tolerance;
            }

            if (breadthMatch) {
              const targetBreadth = parseFloat(breadthMatch[1]);
              matches = matches && Math.abs(dim.breadth - targetBreadth) <= targetBreadth * tolerance;
            }

            if (heightMatch) {
              const targetHeight = parseFloat(heightMatch[1]);
              matches = matches && Math.abs(dim.height - targetHeight) <= targetHeight * tolerance;
            }

            if (upsMatch) {
              const targetUps = parseInt(upsMatch[1]);
              matches = matches && dim.ups === targetUps;
            }

            return matches;
          }) || false;
        }

        return textMatch || dimensionMatches;
      });
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortField === 'name') {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortField === 'createdAt') {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        }

        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    setFilteredDielines(filtered);
    setCurrentPage(1);
  }, [searchTerm, dielines, sortField, sortDirection]);

  // Sorting handler
  const handleSort = (field: 'name' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Row expansion toggle
  const toggleRowExpansion = (dielineId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(dielineId)) {
      newExpanded.delete(dielineId);
    } else {
      newExpanded.add(dielineId);
    }
    setExpandedRows(newExpanded);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredDielines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDielines = filteredDielines.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Excel export functionality
  const exportToExcel = () => {
    const exportData: any[] = [];

    filteredDielines.forEach(dieline => {
      if (dieline.dimensions && dieline.dimensions.length > 0) {
        dieline.dimensions.forEach((dim, index) => {
          exportData.push({
            'Name': dieline.name,
            'Dimension Set': index + 1,
            'Length (mm)': dim.length,
            'Breadth (mm)': dim.breadth,
            'Height (mm)': dim.height,
            'Dimensions': `${dim.length} × ${dim.breadth} × ${dim.height} mm`,
            'UPS': dim.ups,
            'Created By': dieline.createdBy?.name || 'Legacy Record',
            'Created At': new Date(dieline.createdAt).toLocaleDateString(),
            'Created Time': new Date(dieline.createdAt).toLocaleString(),
          });
        });
      } else {
        exportData.push({
          'Name': dieline.name,
          'Dimension Set': 'No dimensions',
          'Length (mm)': '',
          'Breadth (mm)': '',
          'Height (mm)': '',
          'Dimensions': 'No dimensions',
          'UPS': '',
          'Created By': dieline.createdBy?.name || 'Legacy Record',
          'Created At': new Date(dieline.createdAt).toLocaleDateString(),
          'Created Time': new Date(dieline.createdAt).toLocaleString(),
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dielines');

    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    const fileName = `dielines_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(`Excel file exported: ${fileName}`);
  };

  // Excel import functionality
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < jsonData.length; i++) {
          try {
            const rowData = jsonData[i] as any;

            const dielineData = {
              name: rowData['Name'] || rowData['name'] || `Imported Dieline ${i + 1}`,
              length: parseFloat(rowData['Length (mm)'] || rowData['Length'] || rowData['length'] || '0'),
              breadth: parseFloat(rowData['Breadth (mm)'] || rowData['Breadth'] || rowData['breadth'] || '0'),
              height: parseFloat(rowData['Height (mm)'] || rowData['Height'] || rowData['height'] || '0'),
              tolerance: parseFloat(rowData['Tolerance (%)'] || rowData['Tolerance'] || rowData['tolerance'] || '5')
            };

            if (!dielineData.name || dielineData.length <= 0 || dielineData.breadth <= 0 || dielineData.height <= 0) {
              errors.push(`Row ${i + 1}: Missing or invalid required fields`);
              errorCount++;
              continue;
            }

            await api.post('/dielines', dielineData);
            successCount++;
          } catch (error: any) {
            errors.push(`Row ${i + 1}: ${error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Import failed'}`);
            errorCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} dielines`);
          fetchDielines();
        }

        if (errorCount > 0) {
          toast.error(`Failed to import ${errorCount} dielines. Check console for details.`);
          console.error('Import errors:', errors);
        }

        if (successCount === 0 && errorCount === 0) {
          toast.error('No valid data found in the Excel file');
        }

      } catch (error) {
        toast.error('Failed to read Excel file. Please check the file format.');
        console.error('File reading error:', error);
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onSubmit = async (data: DielineForm) => {
    try {
      const submitData = {
        name: data.name,
        dimensions: dimensions.filter(dim => dim.length > 0 && dim.breadth > 0 && dim.height > 0)
      };

      if (submitData.dimensions.length === 0) {
        toast.error('Please add at least one valid dimension');
        return;
      }

      if (editingDieline) {
        await api.put(`/dielines/${editingDieline._id}`, submitData);
        toast.success('Dieline updated successfully');
      } else {
        await api.post('/dielines', submitData);
        toast.success('Dieline created successfully');
      }

      fetchDielines();
      setShowForm(false);
      setEditingDieline(null);
      setDimensions([{ length: 0, breadth: 0, height: 0, ups: 1 }]);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (dieline: Dieline) => {
    setEditingDieline(dieline);
    reset({
      name: dieline.name,
      dimensions: []
    });
    setDimensions(dieline.dimensions || [{ length: 0, breadth: 0, height: 0, ups: 1 }]);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dieline?')) return;

    try {
      await api.delete(`/dielines/${id}`);
      toast.success('Dieline deleted successfully');
      fetchDielines();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDieline(null);
    setDimensions([{ length: 0, breadth: 0, height: 0, ups: 1 }]);
    reset();
  };

  // Dimension management functions
  const addDimension = () => {
    setDimensions([...dimensions, { length: 0, breadth: 0, height: 0, ups: 1 }]);
  };

  const removeDimension = (index: number) => {
    if (dimensions.length > 1) {
      setDimensions(dimensions.filter((_, i) => i !== index));
    }
  };

  const updateDimension = (index: number, field: keyof DimensionForm, value: number) => {
    const newDimensions = [...dimensions];
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    setDimensions(newDimensions);
  };

  const SortIcon = ({ field }: { field: 'name' | 'createdAt' }) => {
    if (sortField !== field) return null;
    return (
      <ChevronDownIcon
        className={`h-4 w-4 ml-1 transition-transform duration-200 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
      />
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-t-indigo-400 rounded-full animate-spin animate-reverse opacity-40"></div>
            </div>
            <div className="text-slate-500 text-sm font-medium">Loading dielines...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">

          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="flex flex-col space-y-6">
              {/* Title and Stats */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-sm"></div>
                    </div>
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight">
                      Dieline Management
                    </h1>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="font-medium">
                        {filteredDielines.length > 0
                          ? `${startIndex + 1}-${Math.min(endIndex, filteredDielines.length)} of ${filteredDielines.length}`
                          : `${filteredDielines.length} of ${dielines.length}`
                        } dielines
                      </span>
                    </div>
                    {searchTerm && (
                      <div className="flex items-center gap-2">
                        <FunnelIcon className="h-4 w-4 text-blue-400" />
                        <span>Filtered results</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="flex gap-4">
                  <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl px-4 py-3 min-w-[100px]">
                    <div className="text-2xl font-bold text-blue-600">{dielines.length}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Total</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl px-4 py-3 min-w-[100px]">
                    <div className="text-2xl font-bold text-emerald-600">
                      {dielines.reduce((sum, d) => sum + (d.dimensions?.reduce((dimSum, dim) => dimSum + dim.ups, 0) || 0), 0)}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Total UPS</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Bar */}
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                {/* Search Bar */}
                <div className="relative group flex-1 max-w-2xl">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search by name, dimensions (150x100x50), or use filters (length:150, breadth:100, height:50, ups:2)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl 
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all duration-200
                             placeholder:text-slate-400 text-slate-700 shadow-sm hover:shadow-md font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Import Button */}
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={importing}
                      id="dieline-file-input"
                    />
                    <button
                      disabled={importing}
                      className="flex items-center gap-2 px-5 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 
                               rounded-xl text-slate-600 hover:text-amber-600 hover:border-amber-300 hover:bg-white 
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm 
                               hover:shadow-md transform hover:-translate-y-0.5 font-medium group-hover:scale-105"
                    >
                      <DocumentArrowUpIcon className="h-5 w-5" />
                      <span>{importing ? 'Importing...' : 'Import'}</span>
                    </button>
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={exportToExcel}
                    disabled={filteredDielines.length === 0}
                    className="flex items-center gap-2 px-5 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 
                             rounded-xl text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-white 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm 
                             hover:shadow-md transform hover:-translate-y-0.5 font-medium"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>Export</span>
                  </button>

                  {/* Add Button */}
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 
                             text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 
                             shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium group"
                  >
                    <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    <span>Add Dieline</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form Section */}
          {showForm && (
            <div className="mb-8">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-slate-200/60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      {editingDieline ? (
                        <PencilIcon className="h-5 w-5 text-white" />
                      ) : (
                        <PlusIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">
                        {editingDieline ? 'Edit Dieline' : 'Create New Dieline'}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        {editingDieline ? 'Update the dieline information below' : 'Add a new dieline with multiple dimensions'}
                      </p>
                    </div>
                  </div>
                </div>

              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Dieline Name
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-xl 
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white 
                                 transition-all duration-200 text-slate-700 placeholder:text-slate-400 font-medium"
                      placeholder="Enter a descriptive name for this dieline"
                    />
                    {errors.name && (
                      <div className="text-red-500 text-sm flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {errors.name.message}
                      </div>
                    )}
                  </div>


                  {/* Enhanced Dimensions Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-slate-700">Dimensions & UPS Configuration</h3>
                        <div className="px-3 py-1 bg-blue-100/60 text-blue-700 rounded-full text-xs font-medium">
                          {dimensions.length} dimension{dimensions.length !== 1 ? 's' : ''}
                        </div>
                        <button
                          type="button"
                          onClick={addDimension}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg 
                                   hover:bg-blue-100 transition-all duration-200 text-sm font-medium border border-blue-200/50
                                   hover:border-blue-300 transform hover:scale-105"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add Dimension
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {dimensions.map((dimension, index) => (
                        <div key={index} className="group relative">
                          <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-6 border border-slate-200/40 
                                        hover:border-blue-300/40 transition-all duration-200 hover:shadow-md">

                            {/* Dimension Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{index + 1}</span>
                                </div>
                                <span className="font-medium text-slate-700">Dimension Set {index + 1}</span>
                              </div>

                              {dimensions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeDimension(index)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg 
                                           transition-all duration-200 group/btn opacity-0 group-hover:opacity-100"
                                  title="Remove dimension"
                                >
                                  <TrashIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                                </button>
                              )}
                            </div>

                            {/* Dimension Input Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                  Length (mm)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={dimension.length || ''}
                                  onChange={(e) => updateDimension(index, 'length', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg 
                                           focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white
                                           transition-all duration-200 text-slate-700 placeholder:text-slate-400 font-medium"
                                  placeholder="0.0"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                  Breadth (mm)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={dimension.breadth || ''}
                                  onChange={(e) => updateDimension(index, 'breadth', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg 
                                           focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white
                                           transition-all duration-200 text-slate-700 placeholder:text-slate-400 font-medium"
                                  placeholder="0.0"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                  Height (mm)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={dimension.height || ''}
                                  onChange={(e) => updateDimension(index, 'height', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg 
                                           focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white
                                           transition-all duration-200 text-slate-700 placeholder:text-slate-400 font-medium"
                                  placeholder="0.0"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                  UPS
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={dimension.ups || 1}
                                  onChange={(e) => updateDimension(index, 'ups', parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg 
                                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white
                                           transition-all duration-200 text-slate-700 placeholder:text-slate-400 font-medium"
                                  placeholder="1"
                                />
                              </div>
                            </div>

                            {/* Dimension Preview */}
                            {dimension.length > 0 && dimension.breadth > 0 && dimension.height > 0 && (
                              <div className="mt-4 p-3 bg-white/60 rounded-lg border border-slate-200/40">
                                <div className="flex items-center gap-4">
                                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Preview:</span>
                                  <div className="font-mono text-sm font-medium">
                                    <span className="text-blue-600">{dimension.length}</span>
                                    <span className="text-slate-400 mx-1">×</span>
                                    <span className="text-emerald-600">{dimension.breadth}</span>
                                    <span className="text-slate-400 mx-1">×</span>
                                    <span className="text-purple-600">{dimension.height}</span>
                                    <span className="text-slate-400 ml-1">mm</span>
                                  </div>
                                  <div className="px-2 py-1 bg-indigo-100/60 text-indigo-700 rounded text-xs font-medium">
                                    {dimension.ups} UPS
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200/60">
                      <div className="text-sm text-slate-500">
                        All changes will be saved immediately
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 
                                   transition-all duration-200 font-medium border border-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl 
                                   hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md 
                                   hover:shadow-lg transform hover:-translate-y-0.5 font-medium flex items-center gap-2"
                        >
                          {editingDieline ? (
                            <>
                              <PencilIcon className="h-4 w-4" />
                              Update Dieline
                            </>
                          ) : (
                            <>
                              <PlusIcon className="h-4 w-4" />
                              Create Dieline
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Table Section */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden">
            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-100/80 to-blue-100/50 border-b border-slate-200/60">
                    <th className="px-6 py-5 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider 
                                 hover:text-blue-600 transition-colors duration-200 group"
                      >
                        <span>Dieline Name</span>
                        <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Dimensions & UPS
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-5 text-left">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider 
                                 hover:text-blue-600 transition-colors duration-200"
                      >
                        <span>Created Date</span>
                        <SortIcon field="createdAt" />
                      </button>
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40">
                  {currentDielines.map((dieline, index) => {
                    const isExpanded = expandedRows.has(dieline._id);
                    const hasMultipleDimensions = dieline.dimensions && dieline.dimensions.length > 1;

                    return (
                      <React.Fragment key={dieline._id}>
                        <tr className="hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/30 
                                     transition-all duration-200 group border-l-4 border-transparent 
                                     hover:border-l-blue-400">
                          {/* Name Column */}
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl 
                                            flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 
                                            transition-colors duration-200">
                                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-sm"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
                                  {dieline.name}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">
                                  ID: {dieline._id.slice(-8).toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Dimensions Column */}
                          <td className="px-6 py-6">
                            <div className="space-y-2">
                              {dieline.dimensions && dieline.dimensions.length > 0 ? (
                                <>
                                  {/* Show first dimension */}
                                  <div className="flex items-center gap-3">
                                    <div className="font-mono text-sm font-medium bg-white/60 px-3 py-2 rounded-lg border border-slate-200/40">
                                      <span className="text-blue-600">{dieline.dimensions[0].length}</span>
                                      <span className="text-slate-400 mx-1">×</span>
                                      <span className="text-emerald-600">{dieline.dimensions[0].breadth}</span>
                                      <span className="text-slate-400 mx-1">×</span>
                                      <span className="text-purple-600">{dieline.dimensions[0].height}</span>
                                      <span className="text-slate-400 ml-1">mm</span>
                                    </div>
                                    <div className="px-2 py-1 bg-indigo-100/60 text-indigo-700 rounded-md text-xs font-bold">
                                      {dieline.dimensions[0].ups} UPS
                                    </div>
                                  </div>

                                  {/* Show expand button if multiple dimensions */}
                                  {hasMultipleDimensions && (
                                    <button
                                      onClick={() => toggleRowExpansion(dieline._id)}
                                      className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 
                                               font-medium transition-colors duration-200 group/expand"
                                    >
                                      <ChevronDownIcon
                                        className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                          }`}
                                      />
                                      <span>
                                        {isExpanded ? 'Hide' : 'Show'} {dieline.dimensions.length - 1} more dimension{dieline.dimensions.length - 1 !== 1 ? 's' : ''}
                                      </span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                  <span>No dimensions configured</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Created By Column */}
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full 
                                            flex items-center justify-center">
                                <span className="text-emerald-600 text-xs font-bold">
                                  {(dieline.createdBy?.name || 'Legacy').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-slate-600 font-medium">
                                {dieline.createdBy?.name || 'Legacy Record'}
                              </span>
                            </div>
                          </td>

                          {/* Date Column */}
                          <td className="px-6 py-6">
                            <div className="space-y-1">
                              <div className="text-slate-700 font-medium">
                                {new Date(dieline.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(dieline.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-6">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Button (for mobile/quick preview) */}
                              {hasMultipleDimensions && (
                                <button
                                  onClick={() => toggleRowExpansion(dieline._id)}
                                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg 
                                           transition-all duration-200 group/btn tooltip-trigger"
                                  title="View all dimensions"
                                >
                                  <EyeIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEdit(dieline)}
                                className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg 
                                         transition-all duration-200 group/btn"
                                title="Edit dieline"
                              >
                                <PencilIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                              </button>

                              {/* Delete Button */}
                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => handleDelete(dieline._id)}
                                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg 
                                           transition-all duration-200 group/btn"
                                  title="Delete dieline"
                                >
                                  <TrashIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row for Additional Dimensions */}
                        {isExpanded && hasMultipleDimensions && (
                          <tr className="bg-gradient-to-r from-blue-50/30 to-indigo-50/20 border-l-4 border-blue-300">
                            <td colSpan={5} className="px-6 py-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                                  <span className="text-sm font-semibold text-slate-700">
                                    Additional Dimensions ({dieline.dimensions!.length - 1})
                                  </span>
                                </div>

                                <div className="grid gap-3 pl-4">
                                  {dieline.dimensions!.slice(1).map((dim, dimIndex) => (
                                    <div key={dimIndex + 1}
                                      className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-slate-200/40
                                                  hover:border-blue-300/40 transition-all duration-200">
                                      <div className="w-6 h-6 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg 
                                                    flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{dimIndex + 2}</span>
                                      </div>

                                      <div className="flex-1 flex items-center gap-4">
                                        <div className="font-mono text-sm font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/40">
                                          <span className="text-blue-600">{dim.length}</span>
                                          <span className="text-slate-400 mx-1">×</span>
                                          <span className="text-emerald-600">{dim.breadth}</span>
                                          <span className="text-slate-400 mx-1">×</span>
                                          <span className="text-purple-600">{dim.height}</span>
                                          <span className="text-slate-400 ml-1">mm</span>
                                        </div>

                                        <div className="px-3 py-1 bg-indigo-100/60 text-indigo-700 rounded-md text-xs font-bold">
                                          {dim.ups} UPS
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {filteredDielines.length > itemsPerPage && (
              <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/40 px-6 py-5 border-t border-slate-200/60">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 font-medium">
                    Showing <span className="font-bold text-blue-600">{startIndex + 1}</span> to{' '}
                    <span className="font-bold text-blue-600">{Math.min(endIndex, filteredDielines.length)}</span> of{' '}
                    <span className="font-bold text-slate-700">{filteredDielines.length}</span> results
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 
                               bg-white/80 border border-slate-200/60 rounded-lg hover:bg-white hover:border-slate-300 
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                               hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 text-sm font-bold rounded-lg transition-all duration-200 
                                        transform hover:scale-105 ${page === currentPage
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                                  : 'text-slate-600 bg-white/80 border border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-md'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <div key={page} className="flex items-center justify-center w-10 h-10">
                              <span className="text-slate-400 font-bold">...</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 
                               bg-white/80 border border-slate-200/60 rounded-lg hover:bg-white hover:border-slate-300 
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                               hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Empty States */}
            {filteredDielines.length === 0 && dielines.length > 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-blue-100 rounded-3xl mx-auto mb-6 
                              flex items-center justify-center">
                  <MagnifyingGlassIcon className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-3">No results found</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  We couldn't find any dielines matching "<span className="font-medium text-slate-700">{searchTerm}</span>".
                  Try adjusting your search criteria or browse all dielines.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg 
                           hover:bg-blue-200 transition-all duration-200 text-sm font-medium border border-blue-200/50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear Search
                </button>
              </div>
            )}

            {dielines.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl mx-auto mb-6 
                              flex items-center justify-center">
                  <PlusIcon className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-3">No dielines yet</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Start by creating your first dieline. You can add multiple dimensions and UPS configurations for each one.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 
                           text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 
                           shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-lg"
                >
                  <PlusIcon className="h-5 w-5" />
                  Create Your First Dieline
                </button>
              </div>
            )}
          </div>

          {/* Quick Help Section */}
          {searchTerm && (
            <div className="mt-6 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-200/40 p-4">
              <div className="text-sm text-blue-700">
                <span className="font-semibold">Search Tips:</span> Try "150x100x50" for exact dimensions,
                "length:150" for specific measurements, or "ups:2" for UPS values. Use tolerance-based matching for similar dimensions.
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DielinesPage;