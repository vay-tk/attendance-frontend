import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsLeft, 
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  pagination = null,
  onPageChange,
  sortable = true,
  selectable = false,
  onSelectionChange,
  selectedRows = [],
  emptyMessage = "No data available",
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [data, sortConfig]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(row => row._id || row.id));
    }
  };

  const handleRowSelect = (rowId) => {
    if (!onSelectionChange) return;

    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter(id => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };

  const renderSortIcon = (columnKey) => {
    if (!sortable || sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 opacity-0" />;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" />
    );
  };

  const renderCell = (row, column) => {
    const value = getNestedValue(row, column.key);
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString() : '-';
    }
    
    if (column.type === 'currency') {
      return value ? `₹${value.toLocaleString()}` : '₹0';
    }
    
    if (column.type === 'percentage') {
      return value ? `${value}%` : '0%';
    }
    
    return value || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table */}
      <div className="overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Header */}
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`
                      px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}
                    `}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length > 0 ? (
                sortedData.map((row, index) => {
                  const rowId = row._id || row.id || index;
                  return (
                    <motion.tr
                      key={rowId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      {selectable && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowId)}
                            onChange={() => handleRowSelect(rowId)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </td>
                      )}
                      
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            column.className || 'text-gray-900'
                          }`}
                        >
                          {renderCell(row, column)}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * 20) + 1} to{' '}
            {Math.min(pagination.page * 20, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="small"
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
              icon={ChevronsLeft}
            />
            <Button
              variant="outline"
              size="small"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              icon={ChevronLeft}
            />
            
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              size="small"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              icon={ChevronRight}
            />
            <Button
              variant="outline"
              size="small"
              onClick={() => onPageChange?.(pagination.pages)}
              disabled={pagination.page === pagination.pages}
              icon={ChevronsRight}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;