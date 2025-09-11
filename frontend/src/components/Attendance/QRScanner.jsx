import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, X, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import Button from '../UI/Button';
import { useWebcam } from '../../hooks/useWebcam';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';

const QRScanner = ({ 
  onScan, 
  loading = false,
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
    changeDevice
  } = useWebcam();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    // Only cleanup on component unmount, not on re-renders
    return () => {
      console.log('QRScanner cleanup - component unmounting');
      stopScanning();
      stopWebcam();
    };
  }, []); // Empty dependency array to run only on mount/unmount

  // Monitor stream and video element to ensure proper activation
  useEffect(() => {
    if (stream && videoRef.current && videoRef.current.srcObject) {
      console.log('Stream and video element ready, checking if we should start scanning');
      // Small delay to ensure video is playing
      const timer = setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          console.log('Video is ready to play');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [stream, videoRef.current?.srcObject]);

  // Force re-render when stream changes and fix video assignment
  useEffect(() => {
    console.log('Stream changed:', !!stream);
    console.log('isActive changed:', isActive);
    
    // Auto-fix video assignment if stream exists but video srcObject is not set
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      console.log('Auto-fixing video assignment');
      videoRef.current.srcObject = stream;
    }
  }, [stream, isActive]);

  useEffect(() => {
    if ((isActive || stream) && isScanning) {
      startQRScanning();
    } else {
      stopQRScanning();
    }
  }, [isActive, isScanning, stream]);

  const startQRScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          const now = Date.now();
          // Prevent duplicate scans within 2 seconds
          if (now - lastScanTime > 2000) {
            setLastScanTime(now);
            setScanResult(code.data);
            handleQRDetected(code.data);
          }
        }
      }
    }, 100); // Scan every 100ms
  };

  const stopQRScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const handleQRDetected = (qrData) => {
    try {
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      
      // Show success toast
      toast.success('QR Code detected!');
      
      // Call the onScan callback
      if (onScan) {
        onScan(qrData);
      }
      
      // Stop scanning after successful detection
      setIsScanning(false);
    } catch (error) {
      toast.error('Invalid QR code format');
      console.error('QR scan error:', error);
    }
  };

  const startScanning = async () => {
    try {
      console.log('Starting camera...');
      await startWebcam();
      
      // Force re-render and check after delay
      setTimeout(() => {
        console.log('After delay - stream:', !!stream, 'isActive:', isActive);
        console.log('videoRef.current:', !!videoRef.current);
        console.log('videoRef.current.srcObject:', !!videoRef.current?.srcObject);
        
        // Manual assignment if srcObject is null but stream exists
        if (stream && videoRef.current && !videoRef.current.srcObject) {
          console.log('Manually assigning stream to video element');
          videoRef.current.srcObject = stream;
        }
        
        setIsScanning(true);
        toast.success('QR Scanner started. Point camera at QR code.');
      }, 1000); // Increased delay
      
    } catch (error) {
      toast.error('Failed to start camera: ' + error.message);
      console.error('Camera start error:', error);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    stopQRScanning();
    setScanResult('');
  };

  const resetScanner = () => {
    stopScanning();
    setTimeout(() => {
      startScanning();
    }, 100);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <QrCode className="w-12 h-12 text-primary-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">QR Code Scanner</h3>
        <p className="text-gray-600">
          Point your camera at the QR code displayed by your instructor
        </p>
      </div>

      {/* Device Selector */}
      {devices.length > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Settings size={16} className="text-gray-400" />
          <select
            value={selectedDeviceId}
            onChange={(e) => changeDevice(e.target.value)}
            className="input-field text-sm max-w-xs"
            disabled={isScanning}
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Camera Display */}
      <div className="relative max-w-md mx-auto">
        {(isActive || stream) ? (
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-80 object-cover"
            />
            
            {/* QR Scanning Overlay */}
            <div className="absolute inset-0">
              {/* Scanning frame */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-64 h-64">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-400"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-400"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-400"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-400"></div>
                  
                  {/* Scanning line animation */}
                  {isScanning && (
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-primary-400 shadow-lg"
                      animate={{
                        y: [0, 256, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Status indicators */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex justify-between items-center">
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${isScanning 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                    }
                  `}>
                    {isScanning ? '● Scanning...' : '○ Ready'}
                  </div>
                  
                  {scanResult && (
                    <div className="bg-success-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      ✓ QR Detected
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
                  {isScanning 
                    ? 'Position QR code within the frame' 
                    : 'Click "Start Scanner" to begin'
                  }
                </div>
              </div>
            </div>

            {/* Success flash effect */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-green-400"
              />
            )}
          </div>
        ) : (
          <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
            {error ? (
              <div className="text-center text-error-600">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Camera Error</p>
                <p className="text-xs text-gray-500 mt-1">{error}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium">QR Scanner Ready</p>
                <p className="text-xs text-gray-400 mt-1">Click start to activate camera</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-3">
        {!(isActive || stream) ? (
          <div className="space-y-2">
            <Button
              onClick={startScanning}
              icon={Play}
              disabled={!!error || loading}
              loading={loading}
              size="lg"
            >
              Start QR Scanner
            </Button>
            
            {error && (
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <Button
                  onClick={() => {
                    setError('');
                    startScanning();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {isScanning ? (
              <>
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  icon={Pause}
                  disabled={loading}
                >
                  Stop Scanning
                </Button>
                <Button
                  onClick={resetScanner}
                  variant="outline"
                  icon={RotateCcw}
                  disabled={loading}
                >
                  Reset
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsScanning(true)}
                  icon={QrCode}
                  disabled={loading}
                  loading={loading}
                  size="lg"
                >
                  Start Scanning
                </Button>
                <Button
                  onClick={stopWebcam}
                  variant="outline"
                  icon={X}
                >
                  Close Camera
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Last scan result (for debugging - remove in production) */}
      {scanResult && (
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Last scan result:</p>
          <p className="text-sm font-mono bg-white p-2 rounded border break-all">
            {scanResult}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 text-sm mb-2">Scanning Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Hold your device steady and at arm's length</li>
          <li>• Ensure good lighting on the QR code</li>
          <li>• Position the entire QR code within the frame</li>
          <li>• Avoid shadows or glare on the QR code</li>
          <li>• Keep the camera focused and clear</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;