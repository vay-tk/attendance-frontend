import { useState, useRef, useEffect, useCallback } from 'react';

export const useWebcam = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  
  const videoRef = useRef(null);

  // Get available video devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting devices:', err);
      setError('Failed to get camera devices');
    }
  }, [selectedDeviceId]);

  // Start webcam
  const startWebcam = useCallback(async (deviceId = selectedDeviceId) => {
    try {
      setError('');
      console.log('Starting webcam with deviceId:', deviceId);
      
      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : 'environment' // Prefer back camera if no device specified
        },
        audio: false
      };

      console.log('Using constraints:', constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got stream:', newStream);
      
      // Set stream state immediately and don't change it again
      setStream(newStream);
      setSelectedDeviceId(deviceId || selectedDeviceId);
      console.log('Stream state set, newStream:', !!newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        console.log('Set video srcObject');
        
        // Force a small delay to ensure the video element processes the stream
        setTimeout(() => {
          console.log('After timeout - videoRef.current.srcObject:', !!videoRef.current?.srcObject);
        }, 100);
        
        // Wait for video to load and set isActive
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, setting isActive to true');
          setIsActive(true);
        };
        
        videoRef.current.onerror = (err) => {
          console.error('Video element error:', err);
          setIsActive(false);
        };
      } else {
        // If no video ref, still set active
        setIsActive(true);
      }
      
      console.log('Webcam setup completed');
      
    } catch (err) {
      console.error('Error starting webcam:', err);
      setIsActive(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
      } else {
        setError('Failed to start camera. Please try again.');
      }
      throw err; // Re-throw to handle in component
    }
  }, [selectedDeviceId]); // Removed 'stream' from dependencies to prevent reset

  // Stop webcam
  const stopWebcam = useCallback(() => {
    console.log('Stopping webcam, current stream:', !!stream);
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
    console.log('Webcam stopped');
  }, [stream]);

  // Change camera device
  const changeDevice = useCallback(async (deviceId) => {
    console.log('Changing device to:', deviceId);
    setSelectedDeviceId(deviceId);
    if (isActive || stream) {
      await startWebcam(deviceId);
    }
  }, [isActive, stream, startWebcam]);

  // Capture photo from video stream
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !isActive) {
      throw new Error('Camera is not active');
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture photo'));
        }
      }, 'image/jpeg', 0.8);
    });
  }, [isActive]);

  // Initialize devices on mount
  useEffect(() => {
    getDevices();
  }, [getDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    stream,
    error,
    isActive,
    devices,
    selectedDeviceId,
    startWebcam,
    stopWebcam,
    capturePhoto,
    changeDevice,
    getDevices
  };
};