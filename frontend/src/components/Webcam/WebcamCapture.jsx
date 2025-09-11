import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Square, RefreshCw, Settings, X, Play, Pause } from 'lucide-react';
import Button from '../UI/Button';
import { useWebcam } from '../../hooks/useWebcam';
import toast from 'react-hot-toast';

const WebcamCapture = ({ 
  onCapture, 
  onClose, 
  autoStart = false,
  showDeviceSelector = true,
  className = ''
}) => {
  const {
    videoRef,
    stream,
    error,
    isActive,
    devices,
    selectedDeviceId,
    startWebcam,
    stopWebcam,
    capturePhoto,
    changeDevice
  } = useWebcam();

  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (autoStart) {
      startWebcam();
    }
    
    return () => {
      stopWebcam();
    };
  }, [autoStart]);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleCapture();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleCapture = async () => {
    if (!isActive) {
      toast.error('Camera is not active');
      return;
    }

    setIsCapturing(true);
    
    try {
      const blob = await capturePhoto();
      if (blob && onCapture) {
        await onCapture(blob);
        toast.success('Photo captured successfully!');
      }
    } catch (err) {
      toast.error('Failed to capture photo');
      console.error('Capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  const cancelCountdown = () => {
    setCountdown(0);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Camera Capture</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Device Selector */}
      {showDeviceSelector && devices.length > 1 && (
        <div className="flex items-center space-x-2">
          <Settings size={16} className="text-gray-400" />
          <select
            value={selectedDeviceId}
            onChange={(e) => changeDevice(e.target.value)}
            className="input-field text-sm"
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Display */}
      <div className="relative">
        {isActive ? (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-80 object-cover"
            />
            
            {/* Face detection overlay */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary-400 rounded-lg opacity-70" />
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Position your face in the frame
              </div>
            </div>

            {/* Countdown overlay */}
            {countdown > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-6xl font-bold text-white"
                >
                  {countdown}
                </motion.div>
              </div>
            )}

            {/* Capture flash effect */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white opacity-80 animate-ping" />
            )}
          </div>
        ) : (
          <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
            {error ? (
              <div className="text-center text-error-600">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Camera not started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-3">
        {!isActive ? (
          <Button
            onClick={startWebcam}
            icon={Play}
            disabled={!!error}
          >
            Start Camera
          </Button>
        ) : (
          <>
            {countdown > 0 ? (
              <Button
                onClick={cancelCountdown}
                variant="outline"
              >
                Cancel ({countdown})
              </Button>
            ) : (
              <>
                <Button
                  onClick={startCountdown}
                  icon={Camera}
                  disabled={isCapturing}
                  loading={isCapturing}
                >
                  Capture Photo
                </Button>
                <Button
                  onClick={handleCapture}
                  variant="outline"
                  icon={Square}
                  disabled={isCapturing}
                >
                  Instant Capture
                </Button>
                <Button
                  onClick={stopWebcam}
                  variant="outline"
                  icon={Pause}
                >
                  Stop Camera
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 text-sm mb-2">Camera Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Position your face within the outlined frame</li>
          <li>• Ensure good lighting for better recognition</li>
          <li>• Look directly at the camera</li>
          <li>• Remove glasses or face coverings if possible</li>
          <li>• Stay still during capture for best results</li>
        </ul>
      </div>
    </div>
  );
};

export default WebcamCapture;