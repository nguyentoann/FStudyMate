import React from 'react';
import { useTheme } from '../context/ThemeContext';

const CalendarHeaderDarkModeDemo = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Sample calendar data
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Calendar Header Dark Mode Demo</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This demo shows how calendar headers follow dark mode styling.
          <br />
          Current mode: <strong>{darkMode ? 'Dark' : 'Light'}</strong>
        </p>
        
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
        >
          Toggle Dark Mode
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Standard Calendar Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="calendar-header flex justify-between items-center p-4 bg-gray-100 border-b">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold">{currentMonth} {currentYear}</h2>
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 bg-gray-50">
            {days.map((day) => (
              <div key={day} className="calendar-header p-2 text-center text-sm font-medium border-b">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-white p-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="p-2 text-center">
                {index + 1 <= 31 ? index + 1 : ''}
              </div>
            ))}
          </div>
        </div>
        
        {/* Full Calendar Style */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="fc-header-toolbar p-4 bg-gray-100 border-b flex justify-between items-center">
            <div className="fc-toolbar-chunk">
              <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Today</button>
              <button className="text-gray-600 hover:text-gray-900 mr-1">
                <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="fc-toolbar-chunk">
              <h2 className="text-lg font-semibold">{currentMonth} {currentYear}</h2>
            </div>
            <div className="fc-toolbar-chunk">
              <button className="border border-gray-300 px-3 py-1 rounded mr-2">Month</button>
              <button className="border border-gray-300 px-3 py-1 rounded mr-2">Week</button>
              <button className="border border-gray-300 px-3 py-1 rounded">Day</button>
            </div>
          </div>
          <div className="fc-col-header">
            <div className="grid grid-cols-7">
              {days.map((day) => (
                <div key={day} className="fc-col-header-cell p-2 text-center text-sm font-medium border-b bg-gray-50">
                  <a className="fc-col-header-cell-cushion">{day}</a>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-white p-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="p-2 text-center border-b border-r min-h-[80px]">
                <div className="fc-daygrid-day-top text-right mb-1">
                  {index + 1 <= 31 ? index + 1 : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* React Big Calendar Style */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="rbc-toolbar p-4 bg-gray-100 border-b flex justify-between items-center">
            <span className="rbc-btn-group">
              <button className="border border-gray-300 px-3 py-1 rounded-l">Today</button>
              <button className="border-t border-b border-gray-300 px-3 py-1">Back</button>
              <button className="border border-gray-300 px-3 py-1 rounded-r">Next</button>
            </span>
            <span className="rbc-toolbar-label text-lg font-semibold">{currentMonth} {currentYear}</span>
            <span className="rbc-btn-group">
              <button className="border border-gray-300 px-3 py-1 rounded-l">Month</button>
              <button className="border-t border-b border-gray-300 px-3 py-1">Week</button>
              <button className="border-t border-b border-gray-300 px-3 py-1">Work Week</button>
              <button className="border border-gray-300 px-3 py-1 rounded-r">Day</button>
            </span>
          </div>
          <div className="rbc-month-view">
            <div className="rbc-row rbc-month-header">
              {days.map((day) => (
                <div key={day} className="rbc-header p-2 text-center text-sm font-medium border-b bg-gray-50">
                  <span>{day.substring(0, 3)}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-white">
              {Array.from({ length: 35 }).map((_, index) => (
                <div key={index} className="p-2 text-center border-b border-r min-h-[80px]">
                  <span className="rbc-date-cell">
                    {index + 1 <= 31 ? index + 1 : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">CSS Rules Applied</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
{`/* Calendar headers follow dark mode */
body.dark-mode .calendar-header,
body.dark-mode [class*="calendar-header"],
body.dark-mode [class*="calendar"][class*="header"],
body.dark-mode .fc-header-toolbar,
body.dark-mode .fc-toolbar,
body.dark-mode .fc-col-header,
body.dark-mode .fc-col-header-cell,
body.dark-mode .fc-daygrid-day-top,
body.dark-mode .rbc-header,
body.dark-mode .rbc-toolbar,
body.dark-mode .react-calendar__navigation,
body.dark-mode [class*="calendar"] [class*="header"],
body.dark-mode [class*="calendar"] [role="columnheader"],
body.dark-mode [class*="calendar"] th {
  background-color: #1e293b !important;
  color: #f3f4f6 !important;
  border-color: #475569 !important;
}

/* Ensure text in calendar headers is visible */
body.dark-mode .calendar-header *,
body.dark-mode [class*="calendar-header"] *,
body.dark-mode [class*="calendar"][class*="header"] *,
body.dark-mode .fc-header-toolbar *,
body.dark-mode .fc-toolbar *,
body.dark-mode .fc-col-header *,
body.dark-mode .fc-col-header-cell *,
body.dark-mode .rbc-header *,
body.dark-mode .rbc-toolbar *,
body.dark-mode .react-calendar__navigation * {
  color: #f3f4f6 !important;
}`}
        </pre>
      </div>
    </div>
  );
};

export default CalendarHeaderDarkModeDemo; 