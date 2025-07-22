import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * DashboardButtonsExample Component
 * Demonstrates dashboard buttons that maintain their original styling in dark mode
 */
const DashboardButtonsExample = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard Buttons Example</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This example shows buttons that maintain their original styling regardless of dark mode.
          Current mode: <strong>{darkMode ? 'Dark' : 'Light'}</strong>
        </p>
        
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Toggle Dark Mode
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Buttons that Should NOT Change</h2>
          <div className="flex flex-wrap gap-4">
            {/* My Calendar Button */}
            <button className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white">
              <i className="fas fa-calendar mr-2"></i>
              My Calendar
            </button>
            
            {/* Campus Events Button */}
            <button 
              className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white" 
              id="glass-element-437588"
            >
              <i className="fas fa-calendar-day mr-2"></i>
              Campus Events
            </button>
            
            {/* Class Schedule Button */}
            <button className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white">
              <i className="fas fa-clock mr-2"></i>
              Class Schedule
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Buttons that Should Change</h2>
          <div className="flex flex-wrap gap-4">
            {/* Settings Button */}
            <button className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white">
              <i className="fas fa-cog mr-2"></i>
              Settings
            </button>
            
            {/* Profile Button */}
            <button className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white">
              <i className="fas fa-user mr-2"></i>
              Profile
            </button>
            
            {/* Logout Button */}
            <button className="shadow-xl rounded-xl px-6 py-4 font-bold bg-white">
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">How This Works</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Special CSS selectors target buttons with calendar-related text or icons:
            <pre className="bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
              {`button:has(> span:contains("My Calendar")),
button:has(> span:contains("Campus Events")),
button:has(> span:contains("Class Schedule"))`}
            </pre>
          </li>
          <li>
            CSS overrides force these buttons to keep their light mode styling:
            <pre className="bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
              {`background-color: white !important;
color: #111827 !important;`}
            </pre>
          </li>
          <li>
            For older browsers, specific class-based selectors are also used:
            <pre className="bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
              {`button.dark-mode-exempt-button`}
            </pre>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default DashboardButtonsExample; 