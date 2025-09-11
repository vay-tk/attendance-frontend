import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import Button from '../UI/Button';
import { format } from 'date-fns';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onDateChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate || '');
  const [tempEndDate, setTempEndDate] = useState(endDate || '');

  const handleApply = () => {
    onDateChange({
      startDate: tempStartDate,
      endDate: tempEndDate
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStartDate('');
    setTempEndDate('');
    onDateChange({ startDate: '', endDate: '' });
    setIsOpen(false);
  };

  const formatDateDisplay = () => {
    if (!startDate && !endDate) return 'Select date range';
    if (startDate && endDate) {
      return `${format(new Date(startDate), 'MMM dd')} - ${format(new Date(endDate), 'MMM dd')}`;
    }
    if (startDate) return `From ${format(new Date(startDate), 'MMM dd, yyyy')}`;
    if (endDate) return `Until ${format(new Date(endDate), 'MMM dd, yyyy')}`;
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        icon={Calendar}
        className="text-left justify-between w-full sm:w-auto min-w-48"
      >
        {formatDateDisplay()}
        <span className="ml-2">▼</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Select Date Range</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="small"
                onClick={handleClear}
              >
                Clear
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;