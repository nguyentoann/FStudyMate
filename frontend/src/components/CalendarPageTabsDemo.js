import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../pages/CalendarPage.css';

/**
 * CalendarPageTabsDemo Component
 * Demonstrates how calendar-page-tabs retain styling in dark mode
 * while allowing background color to change
 */
const CalendarPageTabsDemo = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className={`calendar-page ${darkMode ? "dark" : ""} p-8`}>
      <h1 className="text-2xl font-bold mb-6">Calendar Page Tabs Demo</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This demo shows how the calendar page tabs maintain their styling in dark mode,
          while allowing the page background to change.
          <br />
          Current mode: <strong>{darkMode ? 'Dark' : 'Light'}</strong>
        </p>
        
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-8"
        >
          Toggle Dark Mode
        </button>
      </div>
      
      {/* Calendar Page Tabs - Original styling preserved in dark mode */}
      <div className="calendar-page-tabs">
        <button
          className={`shadow-xl rounded-xl px-6 py-4 font-bold ${
            activeTab === "calendar" ? "bg-sky-500 " : " bg-white"
          }`}
          onClick={() => setActiveTab("calendar")}
        >
          <i className="fas fa-calendar-alt mr-2"></i>
          My Calendar
        </button>
        <button
          className={`shadow-xl rounded-xl px-6 py-4 font-bold ${
            activeTab === "events" ? "bg-sky-500" : "bg-white"
          }`}
          onClick={() => setActiveTab("events")}
        >
          <i className="fas fa-calendar-day mr-2"></i>
          Campus Events
        </button>
        <button
          className={`shadow-xl rounded-xl px-6 py-4 font-bold ${
            activeTab === "schedule" ? "bg-sky-500" : "bg-white"
          }`}
          onClick={() => setActiveTab("schedule")}
        >
          <i className="fas fa-clock mr-2"></i>
          Class Schedule
        </button>
      </div>
      
      <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">How This Works</h2>
        
        <p className="mb-4">In dark mode:</p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>The page background changes to dark</li>
          <li>The buttons maintain their original white/blue background</li>
          <li>Text colors in the buttons stay the same</li>
          <li>Button shadows remain intact</li>
        </ul>
        
        <h3 className="font-semibold mb-2">CSS Implementation:</h3>
        <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto text-xs">
          {`/* Allow background color to change */
body.dark-mode .calendar-page-tabs {
  /* Only preserve these properties */
  color: inherit !important;
  border-color: inherit !important;
  box-shadow: inherit !important;
}

/* Force white background for non-active tab buttons */
body.dark-mode .calendar-page-tabs button.bg-white {
  background-color: white !important;
  color: #64748b !important;
}

/* Force blue background for active tab buttons */
body.dark-mode .calendar-page-tabs button.bg-sky-500 {
  background-color: #0ea5e9 !important;
  color: white !important;
}`}
        </pre>
      </div>
    </div>
  );
};

export default CalendarPageTabsDemo; 