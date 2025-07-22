import React from 'react';
import { useTheme } from '../context/ThemeContext';
import ExemptButton from './ExemptButton';

/**
 * DarkModeExemptDemo
 * Demonstrates buttons that are exempt from dark mode styling
 */
const DarkModeExemptDemo = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dark Mode Exempt Components</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This demo shows buttons that maintain their original styling regardless of dark mode.
          Current mode: <strong>{darkMode ? 'Dark' : 'Light'}</strong>
        </p>
        
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Toggle Dark Mode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Standard Button (Changes in Dark Mode)</h2>
          <div className="flex flex-wrap gap-4">
            <button className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white">
              <i className="fas fa-home mr-2"></i>
              Standard Button
            </button>
            
            <button className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white">
              <i className="fas fa-cog mr-2"></i>
              Settings
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Exempt Buttons (Maintain Style)</h2>
          <div className="flex flex-wrap gap-4">
            {/* Original Campus Events button that should be exempt */}
            <button 
              className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white dark-mode-exempt" 
              id="glass-element-437588"
            >
              <i className="fas fa-calendar-day mr-2"></i>
              Campus Events
            </button>
            
            {/* Using the ExemptButton component */}
            <ExemptButton>
              <i className="fas fa-calendar mr-2"></i>
              Class Schedule
            </ExemptButton>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-2">How to Exempt Elements from Dark Mode</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Add the <code className="bg-gray-100 px-2 py-1 rounded">dark-mode-exempt</code> class to any element</li>
          <li>Use the <code className="bg-gray-100 px-2 py-1 rounded">&lt;ExemptButton&gt;</code> component</li>
          <li>Add specific selectors in dark-mode.css for elements that should be exempt</li>
        </ol>
      </div>
    </div>
  );
};

export default DarkModeExemptDemo; 