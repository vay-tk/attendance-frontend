import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Clock, Users, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import Button from '../UI/Button';
import toast from 'react-hot-toast';

const QRDisplay = ({ session, onRefresh, refreshLoading }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (session?.qrToken) {
      generateQRCode();
      calculateTimeLeft();
    }
  }, [session]);

  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        if (newTimeLeft <= 0) {
          toast.warning('QR code has expired. Please refresh.');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, session]);

  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        sessionId: session._id,
        token: session.qrToken,
        timestamp: Date.now()
      });

      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const calculateTimeLeft = () => {
    if (!session?.qrTokenExpiry) return 0;
    
    const expiry = new Date(session.qrTokenExpiry);
    const now = new Date();
    const diff = Math.max(0, Math.floor((expiry - now) / 1000));
    
    setTimeLeft(diff);
    return diff;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `attendance-qr-${session.title}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded successfully');
  };

  const handleRefresh = async () => {
    await onRefresh();
    toast.success('QR code refreshed');
  };

  if (!session || session.status !== 'ACTIVE') {
    return (
      <div className="text-center py-8">
        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Start the session to display QR code</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
        <p className="text-gray-600">{session.courseId?.code} - {session.courseId?.title}</p>
        <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
          <Users className="w-4 h-4 mr-1" />
          <span>{session.totalEnrolled} students enrolled</span>
        </div>
      </div>

      <motion.div
        key={session.qrToken}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center"
      >
        <div className="qr-display">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Attendance QR Code"
              className="w-80 h-80 object-contain"
            />
          ) : (
            <div className="w-80 h-80 bg-gray-100 animate-pulse rounded" />
          )}
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="text-center">
          <div className={`
            inline-flex items-center px-4 py-2 rounded-full text-lg font-mono
            ${timeLeft > 300 ? 'bg-success-100 text-success-800' :
              timeLeft > 60 ? 'bg-warning-100 text-warning-800' :
              'bg-error-100 text-error-800'}
          `}>
            <Clock className="w-5 h-5 mr-2" />
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Time remaining until QR code expires
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <Button
            onClick={handleRefresh}
            loading={refreshLoading}
            variant="outline"
            icon={RefreshCw}
          >
            Refresh QR
          </Button>
          <Button
            onClick={downloadQR}
            variant="outline"
            icon={Download}
          >
            Download
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instructions for Students:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Open the attendance app and select "Mark Attendance"</li>
          <li>• Choose "QR Code" method and scan this code</li>
          <li>• Ensure you're within the allowed location if geofencing is enabled</li>
          <li>• Each student can scan only once per session</li>
        </ul>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">
            QR code is active and ready for scanning
          </span>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;