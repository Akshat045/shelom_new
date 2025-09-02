'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Carton } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface CartonForm {
  name: string;
  length: number;
  breadth: number;
  height: number;
  quantity: number;
  companyName: string;
}

const CartonsPage: React.FC = () => {
  const { user } = useAuth();
  const [cartons, setCartons] = useState<Carton[]>([]);
  const [filteredCartons, setFilteredCartons] = useState<Carton[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCarton, setEditingCarton] = useState<Carton | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CartonForm>();

  useEffect(() => {
    fetchCartons();
    // Test if XLSX library is loaded
    console.log('XLSX library loaded:', typeof XLSX !== 'undefined');

    // Listen for carton quantity updates from other pages
    const handleCartonUpdate = () => {
      fetchCartons(searchTerm);
    };

    window.addEventListener('cartonQuantityUpdated', handleCartonUpdate);
    
    return () => {
      window.removeEventListener('cartonQuantityUpdated', handleCartonUpdate);
    };
  }, []);

  const fetchCartons = async (searchQuery = '') => {
    try {
      console.log('Searching cartons with query:', searchQuery);
      const response = await api.get(`/cartons?search=${encodeURIComponent(searchQuery)}&limit=1000`);
      const cartonsData = response.data.cartons || response.data;
      console.log('Search results:', cartonsData.length, 'cartons found');
      setCartons(cartonsData);
      setFilteredCartons(cartonsData);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to fetch cartons');
    } finally {
      setLoading(false);
    }
  };

  // Search functionality with backend search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCartons(searchTerm);
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCartons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCartons = filteredCartons.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Excel export functionality
  const exportToExcel = () => {
    const exportData = filteredCartons.map(carton => ({
      'Name': carton.name,
      'Length (mm)': carton.length,
      'Breadth (mm)': carton.breadth,
      'Height (mm)': carton.height,
      'Dimensions': `${carton.length} × ${carton.breadth} × ${carton.height} mm`,
      'Quantity': carton.quantity,
      'Company Name': carton.companyName,
      'Created By': carton.createdBy?.name || 'Legacy Record',
      'Created At': new Date(carton.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cartons');

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    const fileName = `cartons_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(`Excel file exported: ${fileName}`);
  };

  // Excel import functionality
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileImport called!');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);
    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        console.log('File read successfully, processing...');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        console.log('Data array created, size:', data.length);

        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Workbook created, sheets:', workbook.SheetNames);

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Excel data parsed:', jsonData);

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < jsonData.length; i++) {
          try {
            const rowData = jsonData[i] as any;

            // Map Excel columns to our data structure
            const cartonData = {
              name: rowData['Name'] || rowData['name'] || `Imported Carton ${i + 1}`,
              length: parseFloat(rowData['Length (mm)'] || rowData['Length'] || rowData['length'] || '0'),
              breadth: parseFloat(rowData['Breadth (mm)'] || rowData['Breadth'] || rowData['breadth'] || '0'),
              height: parseFloat(rowData['Height (mm)'] || rowData['Height'] || rowData['height'] || '0'),
              quantity: parseInt(rowData['Quantity'] || rowData['quantity'] || '0'),
              companyName: rowData['Company Name'] || rowData['CompanyName'] || rowData['companyName'] || 'Unknown Company'
            };

            // Validate required fields
            if (!cartonData.name || cartonData.length <= 0 || cartonData.breadth <= 0 || cartonData.height <= 0 || cartonData.quantity <= 0 || !cartonData.companyName) {
              errors.push(`Row ${i + 1}: Missing or invalid required fields`);
              errorCount++;
              continue;
            }

            console.log('Attempting to create carton:', cartonData);
            await api.post('/cartons', cartonData);
            successCount++;
          } catch (error: any) {
            console.error(`Row ${i + 1} error:`, error.response?.data || error.message);
            errors.push(`Row ${i + 1}: ${error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Import failed'}`);
            errorCount++;
          }
        }

        // Show results
        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} cartons`);
          fetchCartons();
        }

        if (errorCount > 0) {
          toast.error(`Failed to import ${errorCount} cartons. Check console for details.`);
          console.error('Import errors:', errors);
        }

        if (successCount === 0 && errorCount === 0) {
          toast.error('No valid data found in the Excel file');
        }

      } catch (error) {
        console.error('File reading error:', error);
        toast.error('Failed to read Excel file. Please check the file format.');
      } finally {
        setImporting(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onSubmit = async (data: CartonForm) => {
    try {
      if (editingCarton) {
        await api.put(`/cartons/${editingCarton._id}`, data);
        toast.success('Carton updated successfully');
      } else {
        await api.post('/cartons', data);
        toast.success('Carton created successfully');
      }

      fetchCartons();
      setShowForm(false);
      setEditingCarton(null);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (carton: Carton) => {
    setEditingCarton(carton);
    reset({
      name: carton.name,
      length: carton.length,
      breadth: carton.breadth,
      height: carton.height,
      quantity: carton.quantity,
      companyName: carton.companyName,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this carton?')) return;

    try {
      await api.delete(`/cartons/${id}`);
      toast.success('Carton deleted successfully');
      fetchCartons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCarton(null);
    reset();
  };

  // Remove stock status function since we're removing stock status

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
          <div className="flex items-center justify-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-400 rounded-full animate-spin animate-reverse opacity-60"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-light text-slate-800 tracking-tight">
                  Carton Management
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>
                    {filteredCartons.length > 0
                      ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredCartons.length)} of ${filteredCartons.length} cartons`
                      : `${filteredCartons.length} of ${cartons.length} cartons`
                    }
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative group">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search by name, company, or dimensions (e.g., 150x100x50)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl 
                             focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all duration-200
                             placeholder:text-slate-400 text-slate-700 shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Import */}
                <div className="relative group">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      console.log('File input changed!', e.target.files);
                      handleFileImport(e);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={importing}
                    id="carton-file-input"
                  />
                  <button
                    disabled={importing}
                    className="flex items-center gap-2 px-5 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 
                             rounded-xl text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-white 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md
                             relative z-0"
                    onClick={() => {
                      console.log('Button clicked!');
                      const fileInput = document.getElementById('carton-file-input') as HTMLInputElement;
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <DocumentArrowUpIcon className="h-5 w-5" />
                    <span className="font-medium">{importing ? 'Importing...' : 'Import'}</span>
                  </button>
                </div>

                {/* Export */}
                <button
                  onClick={exportToExcel}
                  disabled={filteredCartons.length === 0}
                  className="flex items-center gap-2 px-5 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 
                           rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-white 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span className="font-medium">Export</span>
                </button>

                {/* Add Button */}
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 
                           text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 
                           shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Carton</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          {showForm && (
            <div className="mb-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full"></div>
                  <h2 className="text-xl font-light text-slate-800">
                    {editingCarton ? 'Edit Carton' : 'Create New Carton'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Carton Name
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl 
                                 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white 
                                 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                        placeholder="Enter carton name"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Company Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name
                      </label>
                      <input
                        {...register('companyName', { required: 'Company name is required' })}
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl 
                                 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white 
                                 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                        placeholder="Enter company name"
                      />
                      {errors.companyName && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quantity
                    </label>
                    <input
                      {...register('quantity', {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' }
                      })}
                      type="number"
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl 
                               focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white 
                               transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                      placeholder="Enter quantity"
                    />
                    {errors.quantity && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>

                  {/* Dimensions Row */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                      Dimensions (mm)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                          Length
                        </label>
                        <input
                          {...register('length', {
                            required: 'Length is required',
                            min: { value: 0, message: 'Length must be positive' }
                          })}
                          type="number"
                          step="0.1"
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl 
                                   focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white 
                                   transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                          placeholder="0.0"
                        />
                        {errors.length && (
                          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.length.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                          Breadth
                        </label>
                        <input
                          {...register('breadth', {
                            required: 'Breadth is required',
                            min: { value: 0, message: 'Breadth must be positive' }
                          })}
                          type="number"
                          step="0.1"
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl 
                                   focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white 
                                   transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                          placeholder="0.0"
                        />
                        {errors.breadth && (
                          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.breadth.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                          Height
                        </label>
                        <input
                          {...register('height', {
                            required: 'Height is required',
                            min: { value: 0, message: 'Height must be positive' }
                          })}
                          type="number"
                          step="0.1"
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl 
                                   focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white 
                                   transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                          placeholder="0.0"
                        />
                        {errors.height && (
                          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.height.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl 
                               hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-md 
                               hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                    >
                      {editingCarton ? 'Update Carton' : 'Create Carton'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 
                               transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b border-slate-200/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Dimensions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40">
                  {currentCartons.map((carton, index) => {
                    return (
                      <tr
                        key={carton._id}
                        className="hover:bg-emerald-50/30 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                            <span className="font-medium text-slate-800">{carton.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-mono text-sm text-slate-600">
                            <span className="text-emerald-600">{carton.length}</span>
                            <span className="text-slate-400 mx-1">×</span>
                            <span className="text-green-600">{carton.breadth}</span>
                            <span className="text-slate-400 mx-1">×</span>
                            <span className="text-teal-600">{carton.height}</span>
                            <span className="text-slate-400 ml-1">mm</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">{carton.availableQuantity || carton.quantity}</span>
                              <span className="text-slate-500 text-sm">available</span>
                            </div>
                            {carton.totalQuantity && (
                              <div className="text-xs text-slate-500">
                                Total: {carton.totalQuantity} | Used: {carton.totalQuantity - (carton.availableQuantity || 0)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-slate-600">{carton.companyName}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-slate-600">{carton.createdBy?.name || 'Legacy Record'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-slate-500 text-sm">
                            {new Date(carton.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(carton)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg 
                                       transition-all duration-200 group/btn"
                              title="Edit carton"
                            >
                              <PencilIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(carton._id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg 
                                         transition-all duration-200 group/btn"
                                title="Delete carton"
                              >
                                <TrashIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {filteredCartons.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/40 bg-white/30 backdrop-blur-sm">
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCartons.length)} of {filteredCartons.length} results
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-slate-600 bg-white/70 border border-slate-200/60 
                               rounded-lg hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed 
                               transition-all duration-200"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current page
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${page === currentPage
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                                  : 'text-slate-600 bg-white/70 border border-slate-200/60 hover:bg-white hover:border-slate-300'
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
                            <span key={page} className="px-2 py-2 text-slate-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-slate-600 bg-white/70 border border-slate-200/60 
                               rounded-lg hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed 
                               transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Empty States */}
              {filteredCartons.length === 0 && cartons.length > 0 && (
                <div className="text-center py-16">
                  <MagnifyingGlassIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-500 mb-2">No results found</h3>
                  <p className="text-slate-400">Try adjusting your search criteria</p>
                </div>
              )}

              {cartons.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <PlusIcon className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-500 mb-2">No cartons yet</h3>
                  <p className="text-slate-400 mb-6">Create your first carton to get started</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 
                             text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 
                             text-sm font-medium"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add First Carton
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartonsPage;