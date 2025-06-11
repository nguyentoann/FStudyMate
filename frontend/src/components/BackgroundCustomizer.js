import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const BackgroundCustomizer = () => {
  const { 
    backgroundImage, 
    backgroundOpacity, 
    componentOpacity,
    updateBackgroundImage, 
    updateBackgroundOpacity,
    updateComponentOpacity 
  } = useTheme();
  const [imagePreview, setImagePreview] = useState(backgroundImage || '');
  const [bgOpacity, setBgOpacity] = useState(backgroundOpacity);
  const [compOpacity, setCompOpacity] = useState(componentOpacity);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Function to convert an image file to a data URL
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection for upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Image file size must be less than 50MB');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      
      // Convert file to data URL
      const dataUrl = await fileToDataUrl(file);
      
      // Set image preview
      setImagePreview(dataUrl);
      
      // Update the background image in theme context
      updateBackgroundImage(dataUrl);
    } catch (err) {
      setError('Failed to process image file');
      console.error('Error processing file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle background opacity change
  const handleBgOpacityChange = (e) => {
    const newOpacity = parseInt(e.target.value, 10);
    setBgOpacity(newOpacity);
    updateBackgroundOpacity(newOpacity);
  };

  // Handle component opacity change
  const handleCompOpacityChange = (e) => {
    const newOpacity = parseInt(e.target.value, 10);
    setCompOpacity(newOpacity);
    updateComponentOpacity(newOpacity);
  };

  // Handle reset background
  const handleResetBackground = () => {
    setImagePreview('');
    setBgOpacity(50);
    setCompOpacity(90);
    updateBackgroundImage('');
    updateBackgroundOpacity(50);
    updateComponentOpacity(90);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Background & UI Customization</h3>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Image
          </label>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
            ref={fileInputRef}
            disabled={isUploading}
          />
          
          <p className="mt-1 text-sm text-gray-500">
            Select an image file (JPG, PNG, etc.) to use as your background. Maximum size: 50MB.
          </p>
        </div>
        
        {imagePreview && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="border rounded-lg overflow-hidden h-40 relative">
              <img 
                src={imagePreview} 
                alt="Background preview" 
                className="w-full h-full object-cover"
                style={{ opacity: bgOpacity / 100 }}
              />
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Opacity: {bgOpacity}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={bgOpacity}
            onChange={handleBgOpacityChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Component Opacity: {compOpacity}%
          </label>
          <input
            type="range"
            min="30"
            max="100"
            value={compOpacity}
            onChange={handleCompOpacityChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>30%</span>
            <span>90%</span>
            <span>100%</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Adjust the transparency of UI components like cards and panels across the application.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleResetBackground}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundCustomizer;