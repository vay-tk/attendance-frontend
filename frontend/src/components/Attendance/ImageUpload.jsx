import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../UI/Button';
import toast from 'react-hot-toast';

const ImageUpload = ({ sessions, onUpload, loading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSession, setSelectedSession] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (sessions.length === 1) {
      setSelectedSession(sessions[0]._id);
    }
  }, [sessions]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Simple validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size too large. Maximum 20MB allowed.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    toast.success('Image selected successfully!');
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedSession) {
      toast.error('Please select a session and upload an image');
      return;
    }

    await onUpload(selectedFile, selectedSession);
    removeFile();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Photo for Attendance
        </h3>
        <p className="text-gray-600">
          Upload a clear photo of yourself for attendance verification
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

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${dragActive 
            ? 'border-primary-400 bg-primary-50' 
            : selectedFile 
              ? 'border-success-400 bg-success-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-w-xs">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 p-1 bg-error-500 text-white rounded-full hover:bg-error-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile?.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {dragActive ? (
                <Upload className="w-8 h-8 text-primary-600" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                {dragActive ? 'Drop your image here' : 'Upload your photo'}
              </p>
              <p className="text-sm text-gray-600">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supports: JPEG, PNG • Max size: 20MB
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!selectedSession}
            className="w-full sm:w-auto"
          >
            Submit Photo for Verification
          </Button>
        </motion.div>
      )}

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Photo Guidelines:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use a clear, recent photo of yourself</li>
              <li>• Ensure your face is well-lit and visible</li>
              <li>• Avoid blurry or low-quality images</li>
              <li>• Face should be the main focus of the image</li>
              <li>• Remove any face coverings if possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;