import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Square, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../UI/Button';
import toast from 'react-hot-toast';

const FaceCapture = ({ sessions, onCapture, loading }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (sessions.length === 1) {
      setSelectedSession(sessions[0]._id);
    }
  }, [sessions]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      setCapturedImage(blob);
      toast.success('Photo captured successfully!');
    }, 'image/jpeg', 0.8);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const submitPhoto = async () => {
    if (!capturedImage || !selectedSession) {
      toast.error('Please select a session and capture a photo');
      return;
    }

    await onCapture(capturedImage, selectedSession);
    setCapturedImage(null);
    stopCamera();
  };

  const simulateCapture = () => {
    // Create a mock image blob for demo
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple face representation
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#333';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Demo Face Image', 320, 240);
    
    canvas.toBlob((blob) => {
      setCapturedImage(blob);
      toast.success('Demo photo captured!');
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Face Recognition Attendance
        </h3>
        <p className="text-gray-600">
          Use your camera to capture your photo for attendance verification
        </p>
      </div>

      {sessions.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Session
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="input-field"
          >
            <option value="">Choose a session...</option>
            {sessions.map(session => (
              <option key={session._id} value={session._id}>
                {session.title} - {session.courseId?.code}
              </option>
            ))}
          </select>
        </div>
      )}

      {!cameraActive ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="mx-auto w-64 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <Camera className="w-16 h-16 text-gray-400" />
          </div>
          
          {error && (
            <div className="flex items-center justify-center p-3 bg-error-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-error-600 mr-2" />
              <span className="text-sm text-error-700">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={startCamera}
              disabled={!selectedSession || loading}
              className="w-full sm:w-auto"
              icon={Camera}
            >
              Start Camera
            </Button>
            
            {/* Demo button */}
            <Button
              onClick={simulateCapture}
              variant="outline"
              disabled={!selectedSession || loading}
              className="w-full sm:w-auto"
            >
              Simulate Capture (Demo)
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Ensure good lighting for better recognition</p>
            <p>• Look directly at the camera</p>
            <p>• Remove any face coverings if possible</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="relative mx-auto max-w-md">
            {capturedImage ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(capturedImage)}
                  alt="Captured"
                  className="w-full h-64 object-cover rounded-lg bg-gray-900"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-success-400" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-lg bg-gray-900"
                />
                <div className="absolute inset-4 border-2 border-primary-400 rounded-lg opacity-50" />
                <div className="absolute top-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                  Position your face in the frame
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>

          <div className="flex justify-center space-x-3">
            {capturedImage ? (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  icon={RefreshCw}
                >
                  Retake
                </Button>
                <Button
                  onClick={submitPhoto}
                  loading={loading}
                  icon={CheckCircle}
                >
                  Submit Photo
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  icon={Square}
                >
                  Capture Photo
                </Button>
                <Button
                  onClick={simulateCapture}
                  variant="outline"
                  icon={Camera}
                >
                  Demo Capture
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}

      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Face Recognition Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Ensure your face is well-lit and clearly visible</li>
              <li>• Look directly at the camera with a neutral expression</li>
              <li>• Remove glasses or masks if they obscure your face</li>
              <li>• Make sure you've enrolled your face in the system first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceCapture;