// 'use client';

// import React, { useEffect, useState } from 'react';
// import Layout from '@/components/Layout';
// import { useAuth } from '@/contexts/AuthContext';
// import api from '@/lib/api';
// import { Assignment } from '@/types';
// import { DocumentArrowDownIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// const UsageLogPage: React.FC = () => {
//   const { user } = useAuth();
//   const [assignments, setAssignments] = useState<Assignment[]>([]);
//   const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const [filters, setFilters] = useState({
//     dateFrom: '',
//     dateTo: '',
//     dieline: '',
//     carton: '',
//     assignedBy: '',
//   });
//   const [showFilters, setShowFilters] = useState(false);

//   useEffect(() => {
//     fetchAssignments();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [assignments, filters]);

//   const fetchAssignments = async () => {
//     try {
//       const endpoint = user?.role === 'admin' ? '/assignments' : '/assignments/my-assignments';
//       const response = await api.get(endpoint);
//       setAssignments(response.data);
//     } catch (error) {
//       console.error('Failed to fetch assignments:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let filtered = [...assignments];

//     if (filters.dateFrom) {
//       filtered = filtered.filter(assignment =>
//         new Date(assignment.assignedAt) >= new Date(filters.dateFrom)
//       );
//     }

//     if (filters.dateTo) {
//       filtered = filtered.filter(assignment =>
//         new Date(assignment.assignedAt) <= new Date(filters.dateTo + 'T23:59:59')
//       );
//     }

//     if (filters.dieline) {
//       filtered = filtered.filter(assignment =>
//         assignment.dielineId.name.toLowerCase().includes(filters.dieline.toLowerCase())
//       );
//     }

//     if (filters.carton) {
//       filtered = filtered.filter(assignment =>
//         assignment.cartonId.name.toLowerCase().includes(filters.carton.toLowerCase())
//       );
//     }

//     if (filters.assignedBy) {
//       filtered = filtered.filter(assignment =>
//         assignment.assignedBy?.name?.toLowerCase().includes(filters.assignedBy.toLowerCase())
//       );
//     }

//     setFilteredAssignments(filtered);
//     // Reset to first page when filters change
//     setCurrentPage(1);
//   };

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   const handleFilterChange = (key: string, value: string) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       dateFrom: '',
//       dateTo: '',
//       dieline: '',
//       carton: '',
//       assignedBy: '',
//     });
//   };

//   const exportToCSV = () => {
//     const headers = ['Date', 'Dieline', 'Carton', 'Quantity Used', 'Assigned By'];
//     const csvContent = [
//       headers.join(','),
//       ...filteredAssignments.map(assignment => [
//         new Date(assignment.assignedAt).toLocaleDateString(),
//         `"${assignment.dielineId.name}"`,
//         `"${assignment.cartonId.name}"`,
//         assignment.quantityUsed,
//         `"${assignment.assignedBy?.name || 'Unknown User'}"`
//       ].join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `usage-log-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const getTotalQuantityUsed = () => {
//     return filteredAssignments.reduce((sum, assignment) => sum + assignment.quantityUsed, 0);
//   };

//   if (loading) {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="space-y-6 mt-16">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Usage Log</h1>
//             <p className="text-gray-600">
//               {user?.role === 'admin' ? 'All assignments' : 'Your assignments'} -
//               Total: {filteredAssignments.length} records,
//               Quantity used: {getTotalQuantityUsed()} units
//             </p>
//             {filteredAssignments.length > 0 && (
//               <p className="text-sm text-gray-500 mt-1">
//                 Showing {startIndex + 1}-{Math.min(endIndex, filteredAssignments.length)} of {filteredAssignments.length}
//               </p>
//             )}
//           </div>
//           <div className="flex space-x-3">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="btn-secondary flex items-center space-x-2"
//             >
//               <FunnelIcon className="h-5 w-5" />
//               <span>Filters</span>
//             </button>
//             <button
//               onClick={exportToCSV}
//               className="btn-primary flex items-center space-x-2"
//               disabled={filteredAssignments.length === 0}
//             >
//               <DocumentArrowDownIcon className="h-5 w-5" />
//               <span>Export CSV</span>
//             </button>
//           </div>
//         </div>

//         {showFilters && (
//           <div className="card">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   From Date
//                 </label>
//                 <input
//                   type="date"
//                   value={filters.dateFrom}
//                   onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
//                   className="input-field"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   To Date
//                 </label>
//                 <input
//                   type="date"
//                   value={filters.dateTo}
//                   onChange={(e) => handleFilterChange('dateTo', e.target.value)}
//                   className="input-field"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Dieline
//                 </label>
//                 <input
//                   type="text"
//                   value={filters.dieline}
//                   onChange={(e) => handleFilterChange('dieline', e.target.value)}
//                   placeholder="Search dieline..."
//                   className="input-field"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Carton
//                 </label>
//                 <input
//                   type="text"
//                   value={filters.carton}
//                   onChange={(e) => handleFilterChange('carton', e.target.value)}
//                   placeholder="Search carton..."
//                   className="input-field"
//                 />
//               </div>

//               {user?.role === 'admin' && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Assigned By
//                   </label>
//                   <input
//                     type="text"
//                     value={filters.assignedBy}
//                     onChange={(e) => handleFilterChange('assignedBy', e.target.value)}
//                     placeholder="Search user..."
//                     className="input-field"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="mt-4">
//               <button
//                 onClick={clearFilters}
//                 className="btn-secondary text-sm"
//               >
//                 Clear All Filters
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="table-container">
//           <table className="table">
//             <thead className="table-header">
//               <tr>
//                 <th className="table-header-cell">Date & Time</th>
//                 <th className="table-header-cell">Dieline</th>
//                 <th className="table-header-cell">Carton</th>
//                 <th className="table-header-cell">Quantity Used</th>
//                 {user?.role === 'admin' && (
//                   <th className="table-header-cell">Assigned By</th>
//                 )}
//                 <th className="table-header-cell">Dimensions Match</th>
//               </tr>
//             </thead>
//             <tbody className="table-body">
//               {paginatedAssignments.map((assignment) => {
//                 const lengthDiff = Math.abs(assignment.cartonId.length - assignment.dielineId.length);
//                 const breadthDiff = Math.abs(assignment.cartonId.breadth - assignment.dielineId.breadth);
//                 const heightDiff = Math.abs(assignment.cartonId.height - assignment.dielineId.height);

//                 return (
//                   <tr key={assignment._id}>
//                     <td className="table-cell">
//                       <div>
//                         <p className="font-medium">
//                           {new Date(assignment.assignedAt).toLocaleDateString()}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {new Date(assignment.assignedAt).toLocaleTimeString()}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="table-cell">
//                       <div>
//                         <p className="font-medium">{assignment.dielineId.name}</p>
//                         <p className="text-sm text-gray-500">
//                           {assignment.dielineId.length} × {assignment.dielineId.breadth} × {assignment.dielineId.height} mm
//                         </p>
//                         <p className="text-xs text-gray-400">
//                           ±{assignment.dielineId.tolerance}% tolerance
//                         </p>
//                       </div>
//                     </td>
//                     <td className="table-cell">
//                       <div>
//                         <p className="font-medium">{assignment.cartonId.name}</p>
//                         <p className="text-sm text-gray-500">
//                           {assignment.cartonId.length} × {assignment.cartonId.breadth} × {assignment.cartonId.height} mm
//                         </p>
//                       </div>
//                     </td>
//                     <td className="table-cell">
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
//                         {assignment.quantityUsed} units
//                       </span>
//                     </td>
//                     {user?.role === 'admin' && (
//                       <td className="table-cell">
//                         <div>
//                           <p className="font-medium">{assignment.assignedBy?.name || 'Unknown User'}</p>
//                           <p className="text-sm text-gray-500">{assignment.assignedBy?.email || 'No email'}</p>
//                         </div>
//                       </td>
//                     )}
//                     <td className="table-cell">
//                       <div className="text-xs space-y-1">
//                         <div className="flex justify-between">
//                           <span>L:</span>
//                           <span className={lengthDiff <= assignment.dielineId.tolerance ? 'text-green-600' : 'text-red-600'}>
//                             ±{lengthDiff.toFixed(1)}mm
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>B:</span>
//                           <span className={breadthDiff <= assignment.dielineId.tolerance ? 'text-green-600' : 'text-red-600'}>
//                             ±{breadthDiff.toFixed(1)}mm
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>H:</span>
//                           <span className={heightDiff <= assignment.dielineId.tolerance ? 'text-green-600' : 'text-red-600'}>
//                             ±{heightDiff.toFixed(1)}mm
//                           </span>
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="px-6 py-4 border-t border-gray-200/60 bg-gradient-to-r from-slate-50/50 to-purple-50/30">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
//                   <span>Page {currentPage} of {totalPages}</span>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/60 
//                              rounded-xl text-slate-600 hover:text-purple-600 hover:border-purple-300 hover:bg-white 
//                              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
//                   >
//                     <ChevronLeftIcon className="h-4 w-4" />
//                     <span className="font-medium">Previous</span>
//                   </button>

//                   <div className="flex items-center gap-1">
//                     {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }

//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === pageNum
//                               ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
//                               : 'bg-white/70 backdrop-blur-sm border border-slate-200/60 text-slate-600 hover:text-purple-600 hover:border-purple-300 hover:bg-white shadow-sm hover:shadow-md'
//                             }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/60 
//                              rounded-xl text-slate-600 hover:text-purple-600 hover:border-purple-300 hover:bg-white 
//                              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
//                   >
//                     <span className="font-medium">Next</span>
//                     <ChevronRightIcon className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {filteredAssignments.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               {assignments.length === 0
//                 ? 'No usage records found.'
//                 : 'No records match your current filters.'
//               }
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default UsageLogPage;


'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Assignment } from '@/types';
import {
  DocumentArrowDownIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const UsageLogPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    dieline: '',
    carton: '',
    assignedBy: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/assignments' : '/assignments/my-assignments';
      const response = await api.get(endpoint);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combined search and filter logic
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];

    // Apply search query first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment =>
        assignment.dimensionSets.some(set => 
          set.dielineName?.toLowerCase().includes(query) ||
          `${set.length}x${set.breadth}x${set.height}`.toLowerCase().includes(query)
        ) ||
        (assignment.assignedBy && assignment.assignedBy.name?.toLowerCase().includes(query)) ||
        (assignment.assignedBy && assignment.assignedBy.email?.toLowerCase().includes(query)) ||
        assignment.totalSheets.toString().includes(query)
      );
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(assignment =>
        new Date(assignment.assignedAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(assignment =>
        new Date(assignment.assignedAt) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    // Apply specific filters
    if (filters.dieline) {
      filtered = filtered.filter(assignment =>
        assignment.dimensionSets.some(set => 
          set.dielineName?.toLowerCase().includes(filters.dieline.toLowerCase())
        )
      );
    }


    if (filters.assignedBy) {
      filtered = filtered.filter(assignment =>
        assignment.assignedBy?.name?.toLowerCase().includes(filters.assignedBy.toLowerCase())
      );
    }

    return filtered;
  }, [assignments, searchQuery, filters]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      dieline: '',
      carton: '',
      assignedBy: '',
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearAll = () => {
    setSearchQuery('');
    clearFilters();
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Dieline', 'Dimension Sets', 'Sheets Used', 'Total Pieces', 'Assigned By'];
    const csvContent = [
      headers.join(','),
      ...filteredAssignments.map(assignment => [
        new Date(assignment.assignedAt).toLocaleDateString(),
        `"${Array.from(new Set(assignment.dimensionSets.map(set => set.dielineName))).join(', ')}"`,
        `"${assignment.dimensionSets.length} sets"`,
        assignment.totalSheets,
        assignment.dimensionSets.reduce((total, set) => total + (set.sheets * set.ups), 0),
        `"${assignment.assignedBy?.name || (user?.role === 'admin' ? 'Unknown User' : user?.name || 'You')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalQuantityUsed = () => {
    return filteredAssignments.reduce((sum, assignment) => sum + assignment.totalSheets, 0);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchQuery !== '';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 mt-16">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usage Log</h1>
            <div className="text-gray-600 mt-1">
              {user?.role === 'admin' ? 'All assignments' : 'Your assignments'} •
              {filteredAssignments.length} records •
              {getTotalQuantityUsed()} units used
            </div>
            {filteredAssignments.length > 0 && (
              <div className="text-sm text-gray-500 mt-1">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredAssignments.length)} of {filteredAssignments.length}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${showFilters
                  ? 'bg-gray-100 text-gray-700 border border-gray-200'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {hasActiveFilters && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredAssignments.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg 
                       text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dielines, cartons, users..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg 
                     text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 
                       text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Filters active
            </div>
            <button
              onClick={clearAll}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dieline
                </label>
                <input
                  type="text"
                  value={filters.dieline}
                  onChange={(e) => handleFilterChange('dieline', e.target.value)}
                  placeholder="Filter dieline..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 
                           placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carton
                </label>
                <input
                  type="text"
                  value={filters.carton}
                  onChange={(e) => handleFilterChange('carton', e.target.value)}
                  placeholder="Filter carton..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 
                           placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {user?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned By
                  </label>
                  <input
                    type="text"
                    value={filters.assignedBy}
                    onChange={(e) => handleFilterChange('assignedBy', e.target.value)}
                    placeholder="Filter user..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 
                             placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 
                         rounded-md transition-colors text-sm"
              >
                Clear Filters
              </button>
              <span className="text-sm text-gray-500">
                {Object.values(filters).filter(v => v !== '').length} filter(s) applied
              </span>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Dieline
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Dimension Sets
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Quantity Used
                  </th>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Assigned By
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Total Pieces
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAssignments.map((assignment) => {
                  // Skip assignments with missing data
                  if (!assignment.dimensionSets || assignment.dimensionSets.length === 0) {
                    return null;
                  }

                  // Display dimension sets information

                  return (
                    <tr
                      key={assignment._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(assignment.assignedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {Array.from(new Set(assignment.dimensionSets.map(set => set.dielineId))).map((dielineId, index) => {
                            const dielineName = assignment.dimensionSets.find(set => set.dielineId === dielineId)?.dielineName;
                            return (
                              <div key={dielineId}>
                                <p className="font-medium text-gray-900">{dielineName || 'Unknown Dieline'}</p>
                              </div>
                            );
                          })}
                          <p className="text-xs text-gray-500 mt-1">
                            ±5% tolerance
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {assignment.dimensionSets.map((set, index) => (
                            <div key={index} className="text-sm">
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                       bg-blue-100 text-blue-800">
                          {assignment.totalSheets} sheets
                        </span>
                      </td>

                      {user?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {assignment.assignedBy?.name || (user?.role === 'admin' ? 'Unknown User' : 'You')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {assignment.assignedBy?.email || 'No email'}
                            </p>
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {assignment.dimensionSets.length} sets
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {assignment.dimensionSets.reduce((total, set) => total + (set.sheets * set.ups), 0)} total pieces
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 border border-gray-300 
                             rounded-md hover:bg-white hover:text-gray-900 disabled:opacity-50 
                             disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
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
                          className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${currentPage === pageNum
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 border border-gray-300 hover:bg-white hover:text-gray-900'
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
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 border border-gray-300 
                             rounded-md hover:bg-white hover:text-gray-900 disabled:opacity-50 
                             disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAssignments.length === 0 && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {assignments.length === 0 ? 'No usage records found' : 'No matching records'}
              </h3>
              <p className="text-gray-500 mb-4">
                {assignments.length === 0
                  ? 'Usage records will appear here once assignments are created.'
                  : 'Try adjusting your search or filters.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Clear search and filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UsageLogPage;