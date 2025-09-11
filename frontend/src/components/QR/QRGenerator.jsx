import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, RefreshCw, Download, Copy, Clock } from 'lucide-react';
import QRCode from 'qrcode';
import Button from '../UI/Button';
import toast from 'react-hot-toast';

const QRGenerator = ({ 
  data, 
  size = 256, 
  onRefresh, 
  refreshLoading = false,
  expiryTime,
  className = ''
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      generateQRCode();
    }
  }, [data, size]);

  useEffect(() => {
    if (expiryTime) {
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [expiryTime]);

  const generateQRCode = async () => {
    try {
      setError('');
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      const url = await QRCode.toDataURL(dataString, {
        width: size,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrDataUrl(url);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    }
  };

  const updateTimeLeft = () => {
    if (!expiryTime) return;
    
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = Math.max(0, Math.floor((expiry - now) / 1000));
    
    setTimeLeft(diff);
    
    if (diff === 0) {
      toast.warning('QR code has expired');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded');
  };

  const copyData = async () => {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      await navigator.clipboard.writeText(dataString);
      toast.success('QR data copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy data');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`space-y-4 ${className}`}
    >
      {/* QR Code Display */}
      <div className="flex justify-center">
        <div className="relative">
          {qrDataUrl ? (
            <motion.img
              key={qrDataUrl}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={qrDataUrl}
              alt="QR Code"
              className="rounded-lg shadow-sm bg-white p-4"
              style={{ width: size + 32, height: size + 32 }}
            />
          ) : error ? (
            <div 
              className="flex items-center justify-center bg-gray-100 rounded-lg"
              style={{ width: size + 32, height: size + 32 }}
            >
              <div className="text-center text-gray-500">
                <QrCode className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center bg-gray-100 rounded-lg animate-pulse"
              style={{ width: size + 32, height: size + 32 }}
            >
              <QrCode className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Expiry indicator */}
          {expiryTime && timeLeft > 0 && (
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <div className={`
                px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1
                ${timeLeft > 300 ? 'bg-success-100 text-success-800' :
                  timeLeft > 60 ? 'bg-warning-100 text-warning-800' :
                  'bg-error-100 text-error-800'}
              `}>
                <Clock size={12} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2">
        {onRefresh && (
          <Button
            onClick={onRefresh}
            loading={refreshLoading}
            variant="outline"
            size="small"
            icon={RefreshCw}
          >
            Refresh
          </Button>
        )}
        
        <Button
          onClick={downloadQR}
          variant="outline"
          size="small"
          icon={Download}
          disabled={!qrDataUrl}
        >
          Download
        </Button>
        
        <Button
          onClick={copyData}
          variant="outline"
          size="small"
          icon={Copy}
          disabled={!data}
        >
          Copy Data
        </Button>
      </div>

      {/* Status Message */}
      {timeLeft === 0 && expiryTime && (
        <div className="text-center text-error-600 text-sm">
          QR code has expired. Please refresh to generate a new one.
        </div>
      )}
    </motion.div>
  );
};

export default QRGenerator;