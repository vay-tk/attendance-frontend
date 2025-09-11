import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import Button from '../UI/Button';
import { downloadCSV } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ExportButton = ({ 
  data, 
  filename, 
  formats = ['csv', 'json'],
  onExport,
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      toast.warning('No data to export');
      return;
    }

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const exportFilename = `${filename}-${timestamp}`;

      if (onExport) {
        await onExport(format);
      } else {
        switch (format) {
          case 'csv':
            downloadCSV(data, `${exportFilename}.csv`);
            break;
          case 'json':
            downloadJSON(data, `${exportFilename}.json`);
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }
      }

      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadJSON = (data, filename) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (formats.length === 1) {
    return (
      <Button
        onClick={() => handleExport(formats[0])}
        loading={isExporting}
        variant="outline"
        icon={Download}
        className={className}
      >
        Export {formats[0].toUpperCase()}
      </Button>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <Button
        variant="outline"
        icon={Download}
        className="peer"
        disabled={!data || data.length === 0}
      >
        Export
        <span className="ml-1">▼</span>
      </Button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible peer-hover:opacity-100 peer-hover:visible hover:opacity-100 hover:visible transition-all duration-200 z-10">
        <div className="py-2">
          {formats.map((format) => {
            const Icon = format === 'csv' ? Table : FileText;
            return (
              <button
                key={format}
                onClick={() => handleExport(format)}
                disabled={isExporting}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon size={16} className="mr-2" />
                Export as {format.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExportButton;