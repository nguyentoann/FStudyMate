import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const BackgroundCustomizer = () => {
  const { 
    backgroundImage, 
    backgroundOpacity, 
    componentOpacity,
    blurLevel,
    blurType,
    customCursor,
    liquidGlassEffect,
    glassEffectRange,
    glassEffectMaxBrightness,
    glassEffectMinBrightness,
    updateBackgroundImage, 
    updateBackgroundOpacity,
    updateComponentOpacity,
    updateBlurLevel,
    updateBlurType,
    toggleCustomCursor,
    updateCustomCursor,
    toggleLiquidGlassEffect,
    updateLiquidGlassEffect,
    updateGlassEffectRange,
    updateGlassEffectMaxBrightness,
    updateGlassEffectMinBrightness
  } = useTheme();
  const [imagePreview, setImagePreview] = useState(backgroundImage || '');
  const [bgOpacity, setBgOpacity] = useState(backgroundOpacity);
  const [compOpacity, setCompOpacity] = useState(componentOpacity);
  const [blur, setBlur] = useState(blurLevel);
  const [selectedBlurType, setSelectedBlurType] = useState(blurType);
  const [effectRange, setEffectRange] = useState(glassEffectRange);
  const [maxBrightness, setMaxBrightness] = useState(glassEffectMaxBrightness * 100);
  const [minBrightness, setMinBrightness] = useState(glassEffectMinBrightness * 100);
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

  // Handle blur level change
  const handleBlurChange = (e) => {
    const newBlur = parseInt(e.target.value, 10);
    setBlur(newBlur);
    updateBlurLevel(newBlur);
  };

  // Handle blur type change
  const handleBlurTypeChange = (e) => {
    const newBlurType = e.target.value;
    setSelectedBlurType(newBlurType);
    updateBlurType(newBlurType);
  };

  // Handle glass effect range change
  const handleRangeChange = (e) => {
    const newRange = parseInt(e.target.value, 10);
    setEffectRange(newRange);
    updateGlassEffectRange(newRange);
  };

  // Handle glass effect max brightness change
  const handleMaxBrightnessChange = (e) => {
    const newBrightness = parseInt(e.target.value, 10);
    setMaxBrightness(newBrightness);
    updateGlassEffectMaxBrightness(newBrightness / 100);
  };

  // Handle glass effect min brightness change
  const handleMinBrightnessChange = (e) => {
    const newBrightness = parseInt(e.target.value, 10);
    setMinBrightness(newBrightness);
    updateGlassEffectMinBrightness(newBrightness / 100);
  };

  // Handle reset background
  const handleResetBackground = () => {
    setImagePreview('');
    setBgOpacity(50);
    setCompOpacity(90);
    setBlur(5);
    setSelectedBlurType('blur');
    setEffectRange(100);
    setMaxBrightness(90);
    setMinBrightness(10);
    updateBackgroundImage('');
    updateBackgroundOpacity(50);
    updateComponentOpacity(90);
    updateBlurLevel(5);
    updateBlurType('blur');
    updateGlassEffectRange(100);
    updateGlassEffectMaxBrightness(0.9);
    updateGlassEffectMinBrightness(0.1);
    // Reset custom cursor to default (enabled)
    updateCustomCursor(true);
    // Reset liquid glass effect to default (enabled)
    updateLiquidGlassEffect(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mt-6">
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
            <div className="rounded-2xl overflow-hidden h-40 relative">
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
            min="20"
            max="100"
            value={compOpacity}
            onChange={handleCompOpacityChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>20%</span>
            <span>60%</span>
            <span>100%</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Adjust the transparency of UI components like cards and panels across the application.
          </p>
        </div>

        <h4 className="font-medium text-gray-800 mb-3">Blur Effects</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blur Effect Type
          </label>
          <select
            value={selectedBlurType}
            onChange={handleBlurTypeChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="blur">Standard (Gaussian)</option>
            <option value="motion">Motion Blur</option>
            <option value="radial">Radial Blur</option>
            <option value="lens">Lens Blur</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select the type of blur effect to apply to transparent UI components.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blur Intensity: {blur}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={blur}
            onChange={handleBlurChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0px</span>
            <span>10px</span>
            <span>20px</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Adjust the intensity of the blur effect (0px = no blur).
          </p>
        </div>
        
        {/* Blur effect preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blur Effect Preview
          </label>
          <div className="relative h-32 rounded-2xl overflow-hidden">
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500" 
              style={{ opacity: 0.7 }}
            ></div>
            
            {/* Sample content with blur effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="bg-white bg-opacity-70 p-4 rounded-2xl shadow-lg"
                style={{ 
                  backdropFilter: selectedBlurType === 'blur' ? `blur(${blur}px)` :
                                  selectedBlurType === 'motion' ? `blur(${Math.max(1, blur/2)}px) brightness(1.05)` :
                                  selectedBlurType === 'radial' ? `blur(${blur}px) brightness(1.02) contrast(1.05)` :
                                  `blur(${blur}px) saturate(1.1) brightness(1.05)`
                }}
              >
                <p className="text-gray-800 font-medium">Preview Text</p>
                <p className="text-gray-600 text-sm">This shows how the blur effect will look</p>
              </div>
            </div>
          </div>
        </div>
        
        <h4 className="font-medium text-gray-800 mb-3">Additional UI Settings</h4>
        
        {/* Custom cursor toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label htmlFor="customCursor" className="text-sm font-medium text-gray-700 cursor-pointer">
              Custom Mouse Cursor
            </label>
            <button 
              onClick={() => updateCustomCursor(!customCursor)}
              className="relative inline-flex items-center h-6 rounded-full w-12 focus:outline-none"
              aria-pressed={customCursor}
              role="switch"
            >
              <span className="sr-only">Toggle custom cursor</span>
              <span 
                className={`${
                  customCursor ? 'bg-indigo-600' : 'bg-gray-300'
                } absolute h-6 w-12 mx-auto rounded-full transition-colors duration-200 ease-in-out`}
              ></span>
              <span
                className={`${
                  customCursor ? 'translate-x-6' : 'translate-x-0'
                } absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enable or disable the custom mouse cursor. When enabled, your cursor will have a stylized appearance.
          </p>
          {/* Add direct buttons for easier testing */}
          <div className="mt-2 flex space-x-2">
            <button 
              onClick={() => updateCustomCursor(true)}
              className={`px-2 py-1 text-xs rounded ${customCursor ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Enable
            </button>
            <button 
              onClick={() => updateCustomCursor(false)}
              className={`px-2 py-1 text-xs rounded ${!customCursor ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Disable
            </button>
          </div>
        </div>
        
        {/* Liquid glass effect toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              Liquid Glass Effect
            </label>
            <button 
              onClick={() => updateLiquidGlassEffect(!liquidGlassEffect)}
              className="relative inline-flex items-center h-6 rounded-full w-12 focus:outline-none"
              aria-pressed={liquidGlassEffect}
              role="switch"
            >
              <span className="sr-only">Toggle liquid glass effect</span>
              <span 
                className={`${
                  liquidGlassEffect ? 'bg-indigo-600' : 'bg-gray-300'
                } absolute h-6 w-12 mx-auto rounded-full transition-colors duration-200 ease-in-out`}
              ></span>
              <span
                className={`${
                  liquidGlassEffect ? 'translate-x-6' : 'translate-x-0'
                } absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enable or disable the liquid glass effect. When enabled, UI components will light up as your cursor moves near them, creating a dynamic lighting effect.
          </p>
          <div className="mt-2 flex space-x-2">
            <button 
              onClick={() => updateLiquidGlassEffect(true)}
              className={`px-2 py-1 text-xs rounded ${liquidGlassEffect ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Enable
            </button>
            <button 
              onClick={() => updateLiquidGlassEffect(false)}
              className={`px-2 py-1 text-xs rounded ${!liquidGlassEffect ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Disable
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Glass Effect Range: {effectRange}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={effectRange}
            onChange={handleRangeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Adjust the range of the glass effect.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Glass Effect Max Brightness: {maxBrightness}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={maxBrightness}
            onChange={handleMaxBrightnessChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Adjust the maximum brightness of the glass effect.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Glass Effect Min Brightness: {minBrightness}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={minBrightness}
            onChange={handleMinBrightnessChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Adjust the minimum brightness of the glass effect.
          </p>
        </div>

        {/* Liquid glass effect preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Liquid Glass Effect Preview
          </label>
          <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-4">
                <div className="bg-white bg-opacity-70 p-4 rounded-2xl shadow-lg w-32 h-32 flex items-center justify-center overflow-hidden">
                  <p className="text-center text-gray-800">
                    Move your cursor near a specific part of the border
                  </p>
                </div>
                <div className="bg-white bg-opacity-70 p-4 rounded-2xl shadow-lg w-32 h-32 flex items-center justify-center overflow-hidden">
                  <p className="text-center text-gray-800">
                    Only that section will light up brightly
                  </p>
                </div>
              </div>
            </div>
            {!liquidGlassEffect && (
              <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                <p className="text-white font-medium">Effect Disabled</p>
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            This effect creates a liquid glass appearance with each border segment having different brightness levels based on cursor proximity. The closer your cursor is to a specific side, the brighter that side becomes, creating a dynamic lighting effect that follows your movements.
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <ul className="list-disc pl-5">
              <li>Range: Controls how far from the component the effect activates</li>
              <li>Max Brightness: Controls how bright the border becomes when cursor is very close</li>
              <li>Min Brightness: Controls the minimum brightness threshold for the effect to show</li>
              <li>Shadow Direction: The shadow light now follows your cursor position around the borders</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleResetBackground}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundCustomizer;