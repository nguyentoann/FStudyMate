import React, { createContext, useState, useEffect, useContext } from 'react';

// Create theme context
export const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      // Check localStorage for saved preference, default to light mode
      const savedTheme = localStorage.getItem('appDarkMode');
      console.log("Initial theme from localStorage:", savedTheme);
      
      if (savedTheme !== null) {
        return savedTheme === 'true';
      }
      
      // Default to light mode instead of checking system preference
      console.log("Setting default light mode");
      return false;
    } catch (error) {
      console.error("Error initializing theme:", error);
      return false;
    }
  });

  // Initialize background image state
  const [backgroundImage, setBackgroundImage] = useState(() => {
    try {
      const savedBgImage = localStorage.getItem('appBackgroundImage');
      return savedBgImage || '';
    } catch (error) {
      console.error("Error initializing background image:", error);
      return '';
    }
  });

  // Initialize opacity state (default: 50%)
  const [backgroundOpacity, setBackgroundOpacity] = useState(() => {
    try {
      const savedOpacity = localStorage.getItem('appBackgroundOpacity');
      return savedOpacity !== null ? parseInt(savedOpacity, 10) : 50;
    } catch (error) {
      console.error("Error initializing background opacity:", error);
      return 50;
    }
  });

  // Initialize component opacity state (default: 90%)
  const [componentOpacity, setComponentOpacity] = useState(() => {
    try {
      const savedComponentOpacity = localStorage.getItem('appComponentOpacity');
      return savedComponentOpacity !== null ? parseInt(savedComponentOpacity, 10) : 90;
    } catch (error) {
      console.error("Error initializing component opacity:", error);
      return 90;
    }
  });

  // Initialize component blur level state (default: 5px)
  const [blurLevel, setBlurLevel] = useState(() => {
    try {
      const savedBlurLevel = localStorage.getItem('appBlurLevel');
      return savedBlurLevel !== null ? parseInt(savedBlurLevel, 10) : 5;
    } catch (error) {
      console.error("Error initializing blur level:", error);
      return 5;
    }
  });

  // Initialize blur type state (default: 'blur' - standard Gaussian blur)
  const [blurType, setBlurType] = useState(() => {
    try {
      const savedBlurType = localStorage.getItem('appBlurType');
      return savedBlurType || 'blur';
    } catch (error) {
      console.error("Error initializing blur type:", error);
      return 'blur';
    }
  });

  // Initialize custom cursor state (default: true - enabled)
  const [customCursor, setCustomCursor] = useState(() => {
    try {
      const savedCustomCursor = localStorage.getItem('appCustomCursor');
      return savedCustomCursor !== null ? savedCustomCursor === 'true' : true;
    } catch (error) {
      console.error("Error initializing custom cursor:", error);
      return true;
    }
  });

  // Initialize liquid glass effect state (default: true - enabled)
  const [liquidGlassEffect, setLiquidGlassEffect] = useState(() => {
    try {
      const savedLiquidGlassEffect = localStorage.getItem('appLiquidGlassEffect');
      return savedLiquidGlassEffect !== null ? savedLiquidGlassEffect === 'true' : true;
    } catch (error) {
      console.error("Error initializing liquid glass effect:", error);
      return true;
    }
  });

  // Initialize liquid glass effect range (default: 100px)
  const [glassEffectRange, setGlassEffectRange] = useState(() => {
    try {
      const savedRange = localStorage.getItem('appGlassEffectRange');
      return savedRange !== null ? parseInt(savedRange, 10) : 100;
    } catch (error) {
      console.error("Error initializing glass effect range:", error);
      return 100;
    }
  });

  // Initialize liquid glass effect max brightness (default: 0.9)
  const [glassEffectMaxBrightness, setGlassEffectMaxBrightness] = useState(() => {
    try {
      const savedMaxBrightness = localStorage.getItem('appGlassEffectMaxBrightness');
      return savedMaxBrightness !== null ? parseFloat(savedMaxBrightness) : 0.9;
    } catch (error) {
      console.error("Error initializing glass effect max brightness:", error);
      return 0.9;
    }
  });

  // Initialize liquid glass effect min brightness (default: 0.1)
  const [glassEffectMinBrightness, setGlassEffectMinBrightness] = useState(() => {
    try {
      const savedMinBrightness = localStorage.getItem('appGlassEffectMinBrightness');
      return savedMinBrightness !== null ? parseFloat(savedMinBrightness) : 0.1;
    } catch (error) {
      console.error("Error initializing glass effect min brightness:", error);
      return 0.1;
    }
  });

  // Initialize menu type (default: 'floating')
  const [menuType, setMenuType] = useState(() => {
    try {
      const savedMenuType = localStorage.getItem('appMenuType');
      return savedMenuType || 'floating';
    } catch (error) {
      console.error("Error initializing menu type:", error);
      return 'floating';
    }
  });

  // Apply theme changes to document
  useEffect(() => {
    try {
      console.log("Applying theme changes, darkMode:", darkMode);
      
      // Save to localStorage
      localStorage.setItem('appDarkMode', darkMode.toString());
      
      // Handle HTML element for dark mode
      const htmlElement = document.documentElement;
      if (darkMode) {
        htmlElement.classList.add('dark', 'dark-mode');
      } else {
        htmlElement.classList.remove('dark', 'dark-mode');
      }
      
      // Handle body element for dark mode
      const bodyElement = document.body;
      if (darkMode) {
        bodyElement.classList.add('dark-mode');
        bodyElement.style.backgroundColor = '#0f172a';
        bodyElement.style.color = '#f1f5f9';
      } else {
        bodyElement.classList.remove('dark-mode');
        bodyElement.style.backgroundColor = '#f3f4f6';
        bodyElement.style.color = '#111827';
      }

      // Create or update the dark mode style sheet
      let darkModeStyles = document.getElementById('dark-mode-styles');
      if (!darkModeStyles) {
        darkModeStyles = document.createElement('style');
        darkModeStyles.id = 'dark-mode-styles';
        document.head.appendChild(darkModeStyles);
      }

      if (darkMode) {
        darkModeStyles.textContent = `
          /* Global dark mode styles */
          body.dark-mode {
            background-color: #0f172a !important;
            color: #f1f5f9 !important;
          }
          
          /* Remove the overly aggressive styling */
          /* .dark-mode * {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
          } */
          
          /* Apply dark backgrounds only to containers */
          .dark-mode div:not(.search-bar):not(.search-bar *) {
            background-color: transparent;
          }
          
          /* Direct fix for specific class combinations */
          .dark-mode .bg-white.rounded-lg.shadow,
          .dark-mode .bg-white.rounded-lg, 
          .dark-mode div[class*="bg-white"][class*="rounded-lg"][class*="shadow"],
          .dark-mode div[class*="bg-white"][class*="rounded-lg"][class*="p-6"] {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
          }
          
          /* Dark backgrounds for specific containers */
          .dark-mode .card,
          .dark-mode .bg-white,
          .dark-mode .bg-gray-50,
          .dark-mode .bg-gray-100,
          .dark-mode .bg-gray-200,
          .dark-mode section,
          .dark-mode aside,
          .dark-mode main,
          .dark-mode article,
          .dark-mode header:not(.search-bar),
          .dark-mode footer:not(.search-bar),
          .dark-mode nav:not(.search-bar) {
            background-color: #1e293b !important;
          }
          
          /* Make the main app background dark */
          .dark-mode #root,
          .dark-mode #app,
          .dark-mode main,
          .dark-mode .app-container {
            background-color: #0f172a !important;
          }
          
          /* Force text to be light colored for visibility, except specific elements */
          .dark-mode h1, 
          .dark-mode h2, 
          .dark-mode h3, 
          .dark-mode h4, 
          .dark-mode h5, 
          .dark-mode h6,
          .dark-mode p, 
          .dark-mode li {
            color: #f1f5f9 !important;
          }
          
          /* Elements that should retain their colors */
          .dark-mode [class*="calendar"],
          .dark-mode [class*="event"],
          .dark-mode [class*="schedule"],
          .dark-mode button[class*="calendar"],
          .dark-mode button[class*="event"],
          .dark-mode button[class*="schedule"],
          .dark-mode span[class*="calendar"],
          .dark-mode span[class*="event"],
          .dark-mode span[class*="schedule"],
          .dark-mode a[class*="calendar"],
          .dark-mode a[class*="event"],
          .dark-mode a[class*="schedule"] {
            color: inherit !important;
            background-color: inherit !important;
          }
          
          /* Make SVG icons visible */
          .dark-mode svg:not(.search-bar *) {
            color: #f1f5f9 !important;
            fill: currentColor;
          }

          /* Make sure question text is dark mode compatible */
          .dark-mode .question,
          .dark-mode [class*="question"],
          .dark-mode h3.text-lg,
          .dark-mode .text-blue-600,
          .dark-mode .font-semibold.text-blue-600,
          .dark-mode .font-semibold.text-gray-800 {
            color: #f1f5f9 !important;
          }

          /* Target FAQ question headers specifically */
          .dark-mode .FAQPopup h3,
          .dark-mode div[class*="space-y"] h3,
          .dark-mode div[class*="space-y"] .text-lg {
            color: #f1f5f9 !important;
          }
          
          /* Course materials text - specific fix */
          .dark-mode [class*="materials-description"],
          .dark-mode [class*="materials"] p,
          .dark-mode [class*="course"] p {
            color: #94a3b8 !important; /* Use a slightly muted color for better visibility */
          }

          /* Fix for ant-table-thead elements in dark mode */
          .dark-mode .ant-table-thead > tr > th,
          .dark-mode [class*="ant-table-thead"],
          .dark-mode .ant-table-thead th.ant-table-column-sort,
          .dark-mode th.ant-table-cell,
          .dark-mode .ant-table thead > tr > th,
          .dark-mode .ant-table-container table > thead > tr:first-child th:first-child,
          .dark-mode .ant-table-container table > thead > tr:first-child th:last-child,
          .dark-mode .ant-table-header,
          .dark-mode .ant-table-thead th {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }

          /* All table header elements follow dark mode */
          .dark-mode thead,
          .dark-mode th,
          .dark-mode table > thead > tr > th,
          .dark-mode table thead tr th,
          .dark-mode .table-header,
          .dark-mode [class*="table-header"],
          .dark-mode [class*="header-row"] {
            background-color: #1e293b !important;
            color: #f3f4f6 !important;
            border-color: #475569 !important;
          }
          
          /* Make sure all table header text is visible */
          .dark-mode thead *,
          .dark-mode th *,
          .dark-mode .table-header *,
          .dark-mode [class*="header-row"] * {
            color: #f3f4f6 !important;
          }
          
          /* Calendar headers follow dark mode */
          .dark-mode .calendar-header,
          .dark-mode [class*="calendar-header"],
          .dark-mode [class*="calendar"][class*="header"],
          .dark-mode .fc-header-toolbar,
          .dark-mode .fc-toolbar,
          .dark-mode .fc-col-header,
          .dark-mode .fc-col-header-cell,
          .dark-mode .fc-daygrid-day-top,
          .dark-mode .rbc-header,
          .dark-mode .rbc-toolbar,
          .dark-mode .react-calendar__navigation,
          .dark-mode [class*="calendar"] [class*="header"],
          .dark-mode [class*="calendar"] [role="columnheader"],
          .dark-mode [class*="calendar"] th {
            background-color: #1e293b !important;
            color: #f3f4f6 !important;
            border-color: #475569 !important;
          }
          
          /* Ensure text in calendar headers is visible */
          .dark-mode .calendar-header *,
          .dark-mode [class*="calendar-header"] *,
          .dark-mode [class*="calendar"][class*="header"] *,
          .dark-mode .fc-header-toolbar *,
          .dark-mode .fc-toolbar *,
          .dark-mode .fc-col-header *,
          .dark-mode .fc-col-header-cell *,
          .dark-mode .rbc-header *,
          .dark-mode .rbc-toolbar *,
          .dark-mode .react-calendar__navigation * {
            color: #f3f4f6 !important;
          }
          
          /* Fix progress bars in dark mode */
          .dark-mode .progress-bar,
          .dark-mode .ant-progress,
          .dark-mode progress,
          .dark-mode [role="progressbar"],
          .dark-mode [class*="progress"] {
            background-color: rgba(30, 41, 59, 0.6) !important;
            border-color: #475569 !important;
          }
          
          .dark-mode .progress-bar > div,
          .dark-mode .ant-progress-bg,
          .dark-mode .ant-progress-success-bg,
          .dark-mode [class*="progress-bar__fill"],
          .dark-mode [class*="progressBar__fill"],
          .dark-mode [class*="progress"][class*="fill"],
          .dark-mode [class*="progressFill"],
          .dark-mode [role="progressbar"] > div {
            background-color: #3b82f6 !important; /* blue-500 */
            color: #f3f4f6 !important;
          }
          
          /* Ensure progress text is visible */
          .dark-mode .ant-progress-text,
          .dark-mode .ant-progress-status-text,
          .dark-mode [class*="progress"] span,
          .dark-mode [class*="progress"] text,
          .dark-mode [class*="progressText"],
          .dark-mode [role="progressbar"] span {
            color: #f3f4f6 !important;
          }
          
          /* Subject codes should not change color in dark mode */
          .dark-mode .subject-code,
          .dark-mode [class*="subject-code"],
          .dark-mode [class*="subjectCode"],
          .dark-mode [data-type="subject-code"],
          .dark-mode [data-subject-code] {
            color: inherit !important;
            background-color: inherit !important;
          }

          /* Subject codes should not change color in dark mode - stronger selectors */
          .dark-mode .subject-code,
          .dark-mode [class*="subject-code"],
          .dark-mode [class*="subjectCode"],
          .dark-mode [data-type="subject-code"],
          .dark-mode [data-subject-code],
          .dark-mode span[class*="subject-code"],
          .dark-mode div[class*="subject-code"],
          .dark-mode .subject-code *,
          .dark-mode [class*="subject-code"] *,
          .dark-mode [class*="subjectCode"] *,
          .dark-mode [data-type="subject-code"] * {
            color: inherit !important;
            background-color: inherit !important;
            border-color: inherit !important;
          }
          
          /* Fix for subject code spans to NEVER change color */
          .dark-mode span.subject-code,
          .dark-mode span[class="subject-code"],
          .dark-mode span[class^="subject-code"],
          .dark-mode span[class*=" subject-code"],
          .dark-mode span[class*="subject-code"] {
            color: inherit !important;
            background-color: inherit !important;
            border-color: inherit !important;
            opacity: 1 !important;
          }
          
          /* Ultimate fix for subject-code spans - HIGHEST SPECIFICITY */
          html .dark-mode span.subject-code,
          html .dark-mode span[class="subject-code"],
          html .dark-mode span[class*="subject-code"],
          html .dark-mode .subject-code,
          html .dark-mode span.subject-code,
          html .dark-mode *[class*="subject-code"],
          html .dark-mode span[class*="subject-code"] {
            color: inherit !important;
            background-color: inherit !important;
            border-color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            text-decoration: inherit !important;
            padding: inherit !important;
            margin: inherit !important;
            border-radius: inherit !important;
            box-shadow: inherit !important;
            text-shadow: inherit !important;
            letter-spacing: inherit !important;
            opacity: 1 !important;
            display: inline-block !important;
            filter: none !important;
            -webkit-filter: none !important;
          }
          
          /* Preserve exact color values for subject codes */
          .dark-mode span.subject-code,
          .dark-mode span[class="subject-code"],
          .dark-mode span[class*="subject-code"],
          .dark-mode .subject-code {
            all: unset !important;
            display: inline-block !important;
          }
          
          /* Special fix for MAE101 and other subject codes in materials */
          .dark-mode span.subject-code,
          .dark-mode span[class="subject-code"] {
            color: #4F1F59 !important; /* The color from your screenshot */
            background-color: #1E293B !important;
            font-weight: bold !important;
          }
          
          /* Enhanced fix for Overall Progress bar */
          .dark-mode .progress-bar[class*="overall"],
          .dark-mode .overall-progress,
          .dark-mode [class*="progress"][class*="overall"],
          .dark-mode [class*="overall"][class*="progress"],
          .dark-mode [data-label*="Overall"],
          .dark-mode [aria-label*="Overall"],
          .dark-mode div:has(> div[style*="width"]):has(> div[role="progressbar"]) {
            opacity: 1 !important;
            background-color: rgba(100, 116, 139, 0.3) !important; /* slate-500 at 30% opacity */
          }
          
          .dark-mode .progress-bar[class*="overall"] > div,
          .dark-mode .overall-progress > div,
          .dark-mode [class*="progress"][class*="overall"] > div,
          .dark-mode [class*="overall"][class*="progress"] > div,
          .dark-mode [data-label*="Overall"] > div,
          .dark-mode [aria-label*="Overall"] > div,
          .dark-mode div[style*="width"][role="progressbar"] {
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Dashboard-specific progress bars by their percentages */
          .dark-mode div:has(> div[style*="width: 58%"]),
          .dark-mode div:has(> div[style*="width: 75%"]),
          .dark-mode div:has(> div[style*="width: 60%"]),
          .dark-mode div:has(> div[style*="width: 40%"]) {
            background-color: rgba(100, 116, 139, 0.3) !important;
          }
          
          .dark-mode div[style*="width: 58%"],
          .dark-mode div[style*="width: 75%"],
          .dark-mode div[style*="width: 60%"],
          .dark-mode div[style*="width: 40%"] {
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Subject specific bars by color */
          .dark-mode div[style*="width: 58%"] {
            background-color: #3b82f6 !important; /* blue-500 */
          }
          
          .dark-mode div[style*="width: 75%"] {
            background-color: #22c55e !important; /* green-500 */
          }
          
          .dark-mode div[style*="width: 60%"] {
            background-color: #f97316 !important; /* orange-500 */
          }
          
          .dark-mode div[style*="width: 40%"] {
            background-color: #f59e0b !important; /* amber-500 */
          }
          
          /* Preserve Overall Progress bar colors */
          .dark-mode .overall-progress,
          .dark-mode [class*="overall-progress"],
          .dark-mode [class*="overallProgress"],
          .dark-mode [data-progress-type="overall"],
          .dark-mode [aria-label*="Overall Progress"],
          .dark-mode [title*="Overall Progress"],
          .dark-mode .progress-bar[data-label*="Overall"],
          .dark-mode .ant-progress[data-label*="Overall"],
          .dark-mode [class*="progress"][data-label*="Overall"] {
            background-color: inherit !important;
          }
          
          .dark-mode .overall-progress > div,
          .dark-mode [class*="overall-progress"] > div,
          .dark-mode [class*="overallProgress"] > div,
          .dark-mode [data-progress-type="overall"] > div,
          .dark-mode [aria-label*="Overall Progress"] > div,
          .dark-mode [title*="Overall Progress"] > div,
          .dark-mode .progress-bar[data-label*="Overall"] > div,
          .dark-mode .ant-progress-bg[data-label*="Overall"],
          .dark-mode .ant-progress[data-label*="Overall"] .ant-progress-bg {
            background-color: inherit !important;
            color: inherit !important;
          }

          /* Fix for search-container elements */
          .dark-mode [class*="search-container"],
          .dark-mode .search-container,
          .dark-mode .search-container input,
          .dark-mode [class*="search-container"] input {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          
          /* Calendar page tabs exemption - preserve styling except background */
          .dark-mode .calendar-page-tabs {
            color: inherit !important;
            border-color: inherit !important;
            box-shadow: inherit !important;
          }
          
          /* Preserve styling for non-button elements in calendar tabs */
          .dark-mode .calendar-page-tabs > *:not(button),
          .dark-mode .calendar-page-tabs > div,
          .dark-mode .calendar-page-tabs > span {
            color: inherit !important;
            border-color: inherit !important;
            box-shadow: inherit !important;
          }
          
          /* Ensure buttons within calendar tabs maintain exact original styling */
          .dark-mode .calendar-page-tabs button.shadow-xl.rounded-xl.px-6.py-4.font-bold.bg-white {
            background-color: white !important;
            color: #64748b !important;
            border-color: transparent !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          }
          
          /* Force blue background for active tab buttons */
          .dark-mode .calendar-page-tabs button.shadow-xl.rounded-xl.px-6.py-4.font-bold.bg-sky-500 {
            background-color: #0ea5e9 !important;
            color: white !important;
            border-color: transparent !important;
          }
          
          /* Apply dark backgrounds to specific dashboard components */
          .dark-mode [class*="stat"],
          .dark-mode [class*="card"],
          .dark-mode [class*="metric"],
          .dark-mode [class*="score"],
          .dark-mode [class*="count"],
          .dark-mode [class*="total"],
          .dark-mode [class*="average"],
          .dark-mode #quizzes-taken,
          .dark-mode #average-score,
          .dark-mode #total-points,
          .dark-mode #completion-rate {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
          }

          /* Fix buttons to have dark backgrounds */
          .dark-mode button:not([class*="bg-"]):not([class*="calendar"]):not([class*="event"]):not([class*="schedule"]) {
            background-color: #334155 !important;
            color: white !important;
          }

          /* Style specific button variants */
          .dark-mode button.bg-blue-600,
          .dark-mode button.bg-indigo-600,
          .dark-mode button.bg-purple-600,
          .dark-mode button.bg-green-600,
          .dark-mode .btn-primary,
          .dark-mode .btn-secondary,
          .dark-mode .btn-success,
          .dark-mode .btn-danger {
            color: white !important;
          }
          
          /* Form inputs - standardize all search bars */
          .dark-mode input[type="text"],
          .dark-mode input[type="search"],
          .dark-mode [role="search"] input,
          .dark-mode [class*="search"] input,
          .dark-mode form[class*="search"] input,
          .dark-mode div[class*="search"] input {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
            padding-right: 2.5rem !important;
          }
          
          /* Style search icons */
          .dark-mode [class*="search"] svg,
          .dark-mode div[role="search"] svg,
          .dark-mode form[role="search"] svg {
            color: #9ca3af !important;
          }
          
          /* Notification popups */
          .dark-mode [class*="notification"],
          .dark-mode [class*="toast"],
          .dark-mode [class*="popup"],
          .dark-mode [class*="modal"],
          .dark-mode [class*="dialog"],
          .dark-mode [role="dialog"],
          .dark-mode [role="alert"],
          .dark-mode [class*="alert"],
          .dark-mode [id*="notification"] {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          
          /* Quiz and Question section styles for dark mode */
          .dark-mode [class*="quiz-container"],
          .dark-mode [class*="question-container"],
          .dark-mode div[class*="question-box"],
          .dark-mode div[class*="question-wrapper"],
          .dark-mode div[class*="question-content"] {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          
          /* Target quiz question text and title */
          .dark-mode [class*="question-title"],
          .dark-mode h2[class*="question"],
          .dark-mode h3[class*="question"],
          .dark-mode div[class*="question"] h2,
          .dark-mode div[class*="question"] h3,
          .dark-mode div[class*="question"] p {
            color: #f1f5f9 !important;
          }
          
          /* Quiz question content (the actual question text) */
          .dark-mode div[class*="question"] > div,
          .dark-mode [class*="question-text"] {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
          }
          
          /* Question options */
          .dark-mode [class*="option"],
          .dark-mode div[class*="option"],
          .dark-mode button[class*="option"] {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          
          /* Fix for code blocks inside questions */
          .dark-mode pre,
          .dark-mode code {
            background-color: #1a2234 !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          
          /* Toggle colors for dark elements in dark mode */
          .dark-mode .min-h-screen.bg-gray-900 {
            background-color: #0f172a !important;
          }
          
          .dark-mode .py-8.bg-gray-900 {
            background-color: #0f172a !important;
          }
          
          /* Toggle pre-existing dark backgrounds in dark mode */
          .dark-mode .bg-gray-900 {
            background-color: #0f172a !important;
          }
          
          .dark-mode .bg-gray-800 {
            background-color: #1e293b !important;
          }
          
          /* Toggle pre-existing light text in dark mode */
          .dark-mode .text-white {
            color: #94a3b8 !important;
          }
          
          /* For specific combinations */
          .dark-mode .min-h-screen.py-8.bg-gray-900.text-white,
          .dark-mode .min-h-screen.py-8.bg-gray-900,
          .dark-mode .min-h-screen.bg-gray-900,
          .dark-mode .py-8.bg-gray-900 {
            background-color: #0f172a !important;
            color: #f1f5f9 !important;
          }
          
          /* Light mode toggle */
          body:not(.dark-mode) .min-h-screen.py-8.bg-gray-900.text-white,
          body:not(.dark-mode) .min-h-screen.py-8.bg-gray-900,
          body:not(.dark-mode) .min-h-screen.bg-gray-900,
          body:not(.dark-mode) .py-8.bg-gray-900 {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
          }
          
          /* Universal bg class adjustments for dark mode */
          
          /* Light backgrounds */
          .dark-mode [class*="bg-white"],
          .dark-mode [class*="bg-gray-50"],
          .dark-mode [class*="bg-gray-100"],
          .dark-mode [class*="bg-gray-200"] {
            background-color: #1e293b !important;
          }
          
          /* Medium backgrounds */
          .dark-mode [class*="bg-gray-300"],
          .dark-mode [class*="bg-gray-400"],
          .dark-mode [class*="bg-gray-500"] {
            background-color: #334155 !important;
          }
          
          /* Dark backgrounds */
          .dark-mode [class*="bg-gray-600"],
          .dark-mode [class*="bg-gray-700"],
          .dark-mode [class*="bg-gray-800"],
          .dark-mode [class*="bg-gray-900"] {
            background-color: #0f172a !important;
          }
          
          /* Blue colors */
          .dark-mode [class*="bg-blue-50"],
          .dark-mode [class*="bg-blue-100"],
          .dark-mode [class*="bg-blue-200"] {
            background-color: #1e3a8a !important;
          }
          
          .dark-mode [class*="bg-blue-300"],
          .dark-mode [class*="bg-blue-400"],
          .dark-mode [class*="bg-blue-500"] {
            background-color: #2563eb !important;
          }
          
          /* Green colors */
          .dark-mode [class*="bg-green-50"],
          .dark-mode [class*="bg-green-100"],
          .dark-mode [class*="bg-green-200"] {
            background-color: #064e3b !important;
          }
          
          /* Red colors */
          .dark-mode [class*="bg-red-50"],
          .dark-mode [class*="bg-red-100"],
          .dark-mode [class*="bg-red-200"] {
            background-color: #7f1d1d !important;
          }
          
          /* Specific styles for glassmorphism elements */
          .dark-mode [id*="glass-element"],
          .dark-mode [class*="mb-4"][class*="bg-gray-50"][class*="p-4"][class*="rounded-lg"][class*="border"],
          .dark-mode .bg-gray-50.dark\:bg-gray-800.p-4.rounded-lg.border {
            background-color: rgba(30, 41, 59, 0.8) !important;
            border-color: rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.05) rgba(255, 255, 255, 0.05) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
          }
          
          /* Ensure proper text color within glass elements */
          .dark-mode [id*="glass-element"] *,
          .dark-mode [class*="mb-4"][class*="bg-gray-50"][class*="p-4"][class*="rounded-lg"][class*="border"] * {
            color: #f1f5f9 !important;
          }
          
          /* Handle elements with specific animate-fade-in-up class */
          .dark-mode [class*="animate-fade-in-up"] {
            border-color: rgba(255, 255, 255, 0.15) !important;
          }
          
          /* Ant Design core components in dark mode */
          .dark-mode .ant-layout,
          .dark-mode .ant-layout-content,
          .dark-mode .ant-layout-header,
          .dark-mode .ant-layout-footer,
          .dark-mode .ant-layout-sider {
            background-color: #0f172a !important;
            color: #f1f5f9 !important;
          }
          
          /* Ant Design cards */
          .dark-mode .ant-card,
          .dark-mode .ant-card-body,
          .dark-mode .ant-card-head {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          
          /* Ant Design tables */
          .dark-mode .ant-table {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
          }
          
          .dark-mode .ant-table-thead > tr > th {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-bottom: 1px solid #475569 !important;
          }
          
          .dark-mode .ant-table-tbody > tr > td {
            border-bottom: 1px solid #475569 !important;
            color: #f1f5f9 !important;
          }
          
          /* Ant Design form elements */
          .dark-mode .ant-form-item-label > label {
            color: #f1f5f9 !important;
          }
          
          .dark-mode .ant-input,
          .dark-mode .ant-input-affix-wrapper,
          .dark-mode .ant-input-number,
          .dark-mode .ant-select-selector,
          .dark-mode .ant-select-dropdown {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          
          /* Ant Design buttons */
          .dark-mode .ant-btn {
            background-color: #1e293b !important;
            border-color: #475569 !important;
            color: #f1f5f9 !important;
          }
          
          .dark-mode .ant-btn-primary {
            background-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
            color: #ffffff !important;
          }
          
          /* Ant Design dropdown and menus */
          .dark-mode .ant-dropdown-menu,
          .dark-mode .ant-menu {
            background-color: #1e293b !important;
            border-color: #475569 !important;
          }
          
          /* Ant Design modal/drawer */
          .dark-mode .ant-modal-content,
          .dark-mode .ant-modal-header,
          .dark-mode .ant-modal-footer,
          .dark-mode .ant-drawer-wrapper-body,
          .dark-mode .ant-drawer-header {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          
          /* Ant Design notifications/alerts */
          .dark-mode .ant-notification-notice,
          .dark-mode .ant-message-notice-content,
          .dark-mode .ant-alert {
            background-color: #1e293b !important;
            border-color: #475569 !important;
          }
          
          /* Ensure all Ant Design text is visible */
          .dark-mode [class*="ant-"] {
            color: #f1f5f9 !important;
          }
          
          /* Exception for Campus Events button and similar event buttons */
          .dark-mode button[class*="calendar"],
          .dark-mode button[class*="event"],
          .dark-mode button:has(i[class*="fa-calendar"]),
          .dark-mode #glass-element-437588,
          .dark-mode button:has(.fa-calendar-day),
          .dark-mode [id*="glass-element"]:has(i[class*="fa-calendar"]) {
            background-color: white !important;
            color: #111827 !important;
            border-color: transparent !important;
          }
          
          /* Specific buttons that should keep their appearance in dark mode */
          .dark-mode button:has(> span:contains("My Calendar")),
          .dark-mode button:has(> span:contains("Campus Events")),
          .dark-mode button:has(> span:contains("Class Schedule")),
          .dark-mode button:has(> *:contains("My Calendar")),
          .dark-mode button:has(> *:contains("Campus Events")),
          .dark-mode button:has(> *:contains("Class Schedule")),
          .dark-mode button:has(i.fa-calendar-day),
          .dark-mode button:has(i.fa-calendar),
          .dark-mode button:has(i.fa-calendar-alt),
          .dark-mode button.shadow-xl.rounded-xl.px-6.py-4.font-bold.bg-white {
            background-color: white !important;
            color: #111827 !important;
            border-color: transparent !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          }
          
          /* Preserve icon color inside preserved buttons */
          .dark-mode button[class*="calendar"] i,
          .dark-mode button[class*="event"] i,
          .dark-mode button:has(i[class*="fa-calendar"]) i,
          .dark-mode #glass-element-437588 i,
          .dark-mode button:has(.fa-calendar-day) i,
          .dark-mode [id*="glass-element"]:has(i[class*="fa-calendar"]) i,
          .dark-mode .dark-mode-exempt-button,
          .dark-mode .dark-mode-exempt-button * {
            color: inherit !important;
          }
          
          /* Notification dropdown menu specific styles */
          .dark-mode .ant-dropdown-menu,
          .dark-mode .ant-dropdown-menu-root,
          .dark-mode .ant-dropdown-menu-vertical,
          .dark-mode .ant-dropdown-menu-light,
          .dark-mode [class*="ant-dropdown-menu"],
          .dark-mode [class*="css-dev-only-do-not-override"] {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
          }
          
          /* Rules for ant-tag elements to retain their colors in dark mode */
          .dark-mode .ant-tag,
          .dark-mode span.ant-tag,
          .dark-mode [class*="ant-tag"],
          .dark-mode div .ant-tag,
          .dark-mode .material-searchbar .ant-tag {
            background-color: inherit !important;
            color: inherit !important;
            border-color: inherit !important;
          }
          
          /* Specifically target the status tags in MaterialsView */
          .dark-mode .subject-item .ant-tag,
          .dark-mode .subject-item span.px-2.py-1.text-xs.rounded-full {
            background-color: #dcfce7 !important; /* Light green background */
            color: #166534 !important; /* Dark green text */
            border-color: #dcfce7 !important;
          }
          
          /* Only change the material-searchbar styles in dark mode */
          .dark-mode .material-searchbar .search-container {
            background-color: #1e293b !important;
          }
          
          /* Override specifically for the notification dropdown with its full class name */
          .dark-mode .ant-dropdown-menu.ant-dropdown-menu-root.ant-dropdown-menu-vertical.ant-dropdown-menu-light.css-dev-only-do-not-override-2y4vty {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
        `;
      } else {
        darkModeStyles.textContent = '';
      }
      
      console.log("Theme updated successfully:", darkMode ? "dark" : "light");
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [darkMode]);

  // Apply background image and opacity
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('appBackgroundImage', backgroundImage);
      localStorage.setItem('appBackgroundOpacity', backgroundOpacity.toString());

      // Apply background styles
      const bodyElement = document.body;
      
      // Create a style block for the background
      let styleElement = document.getElementById('custom-background-style');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-background-style';
        document.head.appendChild(styleElement);
      }

      // If we have a background image, set it with opacity
      if (backgroundImage) {
        // Create an opacity value as decimal (0-1)
        const opacityValue = backgroundOpacity / 100;
        
        // Set the style with pseudo element to control opacity
        styleElement.textContent = `
          body {
            position: relative;
          }
          
          body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background-image: url(${backgroundImage});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: ${opacityValue};
            pointer-events: none;
          }
          
          /* Ensure the main container has a relative position */
          #root, #app, .app-container, main {
            position: relative;
            z-index: 1;
          }
        `;
      } else {
        // Remove background image styles if no image is set
        styleElement.textContent = '';
      }

      console.log("Background updated successfully:", backgroundImage ? "custom" : "none");
    } catch (error) {
      console.error("Error applying background:", error);
    }
  }, [backgroundImage, backgroundOpacity]);

  // Apply component opacity
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('appComponentOpacity', componentOpacity.toString());
      localStorage.setItem('appBlurLevel', blurLevel.toString());
      localStorage.setItem('appBlurType', blurType);

      // Create a style block for component opacity
      let componentStyleElement = document.getElementById('custom-component-style');
      if (!componentStyleElement) {
        componentStyleElement = document.createElement('style');
        componentStyleElement.id = 'custom-component-style';
        document.head.appendChild(componentStyleElement);
      }

      // Calculate opacity value
      const opacityValue = componentOpacity / 100;
      
      // Determine blur filter based on type
      let blurFilter = '';
      switch(blurType) {
        case 'blur':
          blurFilter = `blur(${blurLevel}px)`;
          break;
        case 'motion':
          blurFilter = `blur(${Math.max(1, blurLevel/2)}px) brightness(1.05)`;
          break;
        case 'radial':
          blurFilter = `blur(${blurLevel}px) brightness(1.02) contrast(1.05)`;
          break;
        case 'lens':
          blurFilter = `blur(${blurLevel}px) saturate(1.1) brightness(1.05)`;
          break;
        default:
          blurFilter = `blur(${blurLevel}px)`;
      }
      
      // Apply the opacity to specific elements more selectively
      componentStyleElement.textContent = `
        /* Apply to content cards and panels */
        .bg-white:not(nav):not(.navbar):not(header),
        .bg-gray-50:not(nav):not(.navbar):not(header),
        .bg-gray-100:not(nav):not(.navbar):not(header),
        .card:not(nav):not(.navbar):not(header),
        .rounded-lg.shadow-md:not(nav):not(.navbar):not(header),
        .rounded-lg.shadow-lg:not(nav):not(header),
        .rounded-lg.shadow-xl:not(nav):not(header),
        .rounded-md.shadow-md:not(nav):not(header) {
          background-color: rgba(255, 255, 255, ${opacityValue}) !important;
          backdrop-filter: ${blurFilter};
        }

        /* Apply to dark themed components with the same rule */
        .dark .bg-gray-800:not(nav):not(.navbar):not(header),
        .dark .bg-gray-900:not(nav):not(.navbar):not(header) {
          background-color: rgba(31, 41, 55, ${opacityValue}) !important;
          backdrop-filter: ${blurFilter};
        }
        
        /* Special rule for top navigation elements only */
        header, .navbar:not(.sidebar), nav.top-nav {
          position: relative;
          z-index: 10;
          background-color: rgba(var(--navbar-bg-color, 79, 70, 229), 0.9) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        /* Fix for sidebar - keep it white */
        .sidebar, aside, #sidebar, .side-nav, [class*="menu"] {
          background-color: #ffffff !important;
        }
        
        /* Add a CSS variable to store the navbar color if not already present */
        :root {
          --navbar-bg-color: 79, 70, 229; /* Default indigo color for navbar */
        }
      `;

      console.log("Component opacity updated successfully:", componentOpacity + "%");
      console.log("Blur level updated successfully:", blurLevel + "px");
      console.log("Blur type updated successfully:", blurType);
    } catch (error) {
      console.error("Error applying component opacity:", error);
    }
  }, [componentOpacity, blurLevel, blurType]);

  // Apply custom cursor
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('appCustomCursor', customCursor.toString());

      // Create or get the custom cursor style element
      let cursorStyleElement = document.getElementById('custom-cursor-style');
      if (!cursorStyleElement) {
        cursorStyleElement = document.createElement('style');
        cursorStyleElement.id = 'custom-cursor-style';
        document.head.appendChild(cursorStyleElement);
      }

      // Apply custom cursor styles if enabled
      if (customCursor) {
        cursorStyleElement.textContent = `
          /* Base cursor for all elements */
          html, body, div, span, a, p, h1, h2, h3, h4, h5, h6, button, input, select, textarea {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="rgba(79, 70, 229, 0.5)" stroke="white" stroke-width="1.5"/></svg>') 8 8, auto !important;
          }
          
          /* Pointer cursor for interactive elements */
          a, button, [role="button"], [type="button"], [type="submit"], [type="reset"], label[for], select, summary, .cursor-pointer {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="rgba(79, 70, 229, 0.6)" stroke="white" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="white"/></svg>') 12 12, pointer !important;
          }
          
          /* Text cursor for text inputs */
          input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], input[type="number"], textarea {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24"><path d="M8,4 L8,20" stroke="white" stroke-width="2"/><path d="M8,4 L8,20" stroke="rgba(79, 70, 229, 0.7)" stroke-width="1"/></svg>') 8 12, text !important;
          }
        `;
      } else {
        // Remove custom cursor styles
        cursorStyleElement.textContent = '';
      }

      console.log("Custom cursor updated successfully:", customCursor ? "enabled" : "disabled");
    } catch (error) {
      console.error("Error applying custom cursor:", error);
    }
  }, [customCursor]);

  // Apply liquid glass effect
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('appLiquidGlassEffect', liquidGlassEffect.toString());
      localStorage.setItem('appGlassEffectRange', glassEffectRange.toString());
      localStorage.setItem('appGlassEffectMaxBrightness', glassEffectMaxBrightness.toString());
      localStorage.setItem('appGlassEffectMinBrightness', glassEffectMinBrightness.toString());

      // Create or get the liquid glass script element
      let liquidGlassScriptElement = document.getElementById('liquid-glass-script');
      
      // If the effect is enabled and the script doesn't exist, create it
      if (liquidGlassEffect) {
        if (!liquidGlassScriptElement) {
          liquidGlassScriptElement = document.createElement('script');
          liquidGlassScriptElement.id = 'liquid-glass-script';
          document.body.appendChild(liquidGlassScriptElement);
        }

        // Set the script content
        liquidGlassScriptElement.textContent = `
          (function() {
            // Track mouse position
            let mouseX = 0;
            let mouseY = 0;
            let isMouseMoving = false;
            let mouseTimer = null;
            let rafId = null;
            let lastApplyTime = 0;
            
            // Configuration from React state
            const effectRange = ${glassEffectRange}; // Distance in pixels
            const maxBrightness = ${glassEffectMaxBrightness}; // Maximum brightness (0-1)
            const minBrightness = ${glassEffectMinBrightness}; // Minimum brightness (0-1)
            const frameThrottle = 25; // Only update every 25ms (40fps max)
            
            // Throttled function to apply effects using requestAnimationFrame
            function throttledApplyEffect() {
              if (rafId) {
                return; // Don't schedule multiple rAF calls
              }
              
              rafId = requestAnimationFrame(() => {
                const now = performance.now();
                if (now - lastApplyTime >= frameThrottle) {
                  applyLiquidGlassBorderEffect();
                  lastApplyTime = now;
                }
                rafId = null;
              });
            }
            
            // Update mouse position on move with throttling
            document.addEventListener('mousemove', function(e) {
              mouseX = e.clientX;
              mouseY = e.clientY;
              isMouseMoving = true;
              
              // Clear any existing timer
              if (mouseTimer) {
                clearTimeout(mouseTimer);
              }
              
              // Set a timer to detect when mouse stops moving
              mouseTimer = setTimeout(function() {
                isMouseMoving = false;
                // Remove effects when mouse is stationary for a while
                resetAllBorders();
              }, 1000); // 1 second of inactivity
              
              // Apply the effect with throttling
              throttledApplyEffect();
            });
            
            // Apply effect on scroll with throttling
            let scrollTimeout = null;
            document.addEventListener('scroll', function() {
              if (!isMouseMoving) return;
              
              // Clear previous timeout
              if (scrollTimeout) {
                clearTimeout(scrollTimeout);
              }
              
              // Throttle scroll events
              scrollTimeout = setTimeout(() => {
                throttledApplyEffect();
              }, 50); // 50ms throttle for scroll events
            });
            
            // Cache DOM selectors to avoid repeated queries
            const glassElementSelector = '.bg-white:not(nav):not(.navbar):not(header), .bg-gray-50:not(nav):not(.navbar):not(header), .bg-gray-100:not(nav):not(.navbar):not(header), .card:not(nav):not(.navbar):not(header), .rounded-lg.shadow-md:not(nav):not(.navbar):not(header), .rounded-lg.shadow-lg:not(nav):not(header), .rounded-lg.shadow-xl:not(nav):not(header), .rounded-md.shadow-md:not(nav):not(header), .dark .bg-gray-800:not(nav):not(.navbar):not(header), .dark .bg-gray-900:not(nav):not(.navbar):not(header)';
            
            // Track which elements have effects applied
            const activeElements = new Set();
            
            // Function to reset all borders when mouse is inactive
            function resetAllBorders() {
              // Only reset elements that have active effects
              activeElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                  // Reset styles
                  element.style.boxShadow = '';
                  
                  // Remove CSS rules
                  const styleEl = document.getElementById('liquid-glass-styles');
                  if (styleEl) {
                    styleEl.textContent = styleEl.textContent.replace(new RegExp('#' + elementId + '\\s*\\{[^\\}]*\\}', 'g'), '');
                  }
                }
              });
              
              // Clear the set of active elements
              activeElements.clear();
            }
            
            // Function to apply the liquid glass border effect
            function applyLiquidGlassBorderEffect() {
              // Target elements with backdrop-filter - use a more efficient selector when possible
              // Only query visible elements in the viewport for better performance
              const glassElements = document.querySelectorAll(glassElementSelector);
              
              glassElements.forEach(element => {
                // Get element position
                const rect = element.getBoundingClientRect();
                
                // Skip elements that are not visible or outside viewport
                if (rect.width === 0 || rect.height === 0 || 
                    rect.bottom < 0 || rect.top > window.innerHeight || 
                    rect.right < 0 || rect.left > window.innerWidth) {
                  return;
                }
                
                // Calculate nearest point on border to mouse
                // First determine which region the mouse is in relative to the element
                const isAbove = mouseY < rect.top;
                const isBelow = mouseY > rect.bottom;
                const isLeft = mouseX < rect.left;
                const isRight = mouseX > rect.right;
                
                // Calculate the nearest point on the border to the mouse
                let nearestX, nearestY;
                
                // X coordinate of nearest point
                if (isLeft) {
                  nearestX = rect.left;
                } else if (isRight) {
                  nearestX = rect.right;
                } else {
                  nearestX = mouseX;
                }
                
                // Y coordinate of nearest point
                if (isAbove) {
                  nearestY = rect.top;
                } else if (isBelow) {
                  nearestY = rect.bottom;
                } else {
                  nearestY = mouseY;
                }
                
                // Calculate squared distance to avoid expensive square root operation
                const distX = mouseX - nearestX;
                const distY = mouseY - nearestY;
                const distanceSquared = distX * distX + distY * distY;
                
                // Calculate max distance squared for effect using the configured range
                const maxDistanceSquared = effectRange * effectRange;
                
                // Calculate intensity based on distance (closer = more intense)
                // Use squared distances to avoid square root calculation
                const normalizedDistance = Math.min(distanceSquared, maxDistanceSquared) / maxDistanceSquared;
                const intensity = 1 - normalizedDistance; // 0 to 1 range
                
                // Only apply effect if the cursor is relatively close and moving
                if (intensity > minBrightness && isMouseMoving) {
                  // Scale intensity between min and max brightness
                  const scaledIntensity = minBrightness + (intensity * (maxBrightness - minBrightness));
                  
                  // Create a gradient that's brightest at the nearest point
                  // Determine which side(s) the nearest point is on
                  const isOnTop = Math.abs(nearestY - rect.top) < 1;
                  const isOnRight = Math.abs(nearestX - rect.right) < 1;
                  const isOnBottom = Math.abs(nearestY - rect.bottom) < 1;
                  const isOnLeft = Math.abs(nearestX - rect.left) < 1;
                  
                  // Calculate the position of the nearest point as a percentage of the element's dimensions
                  const percentX = isOnLeft ? 0 : isOnRight ? 100 : ((nearestX - rect.left) / rect.width * 100);
                  const percentY = isOnTop ? 0 : isOnBottom ? 100 : ((nearestY - rect.top) / rect.height * 100);
                  
                  // Create a radial gradient that's brightest at the nearest point
                  let gradientPosition;
                  if (isOnTop) {
                    gradientPosition = \`\${percentX}% 0%\`;
                  } else if (isOnRight) {
                    gradientPosition = \`100% \${percentY}%\`;
                  } else if (isOnBottom) {
                    gradientPosition = \`\${percentX}% 100%\`;
                  } else if (isOnLeft) {
                    gradientPosition = \`0% \${percentY}%\`;
                  } else {
                    // Shouldn't happen, but just in case
                    gradientPosition = \`\${percentX}% \${percentY}%\`;
                  }
                  
                  // Apply border effect using border-color instead of borderImage to preserve rounded corners
                  
                  // Store the original border style if we haven't already
                  if (!element.hasAttribute('data-original-border')) {
                    const originalBorder = getComputedStyle(element).border;
                    element.setAttribute('data-original-border', originalBorder);
                  }
                  
                  // Store the original position if we haven't already
                  if (!element.hasAttribute('data-original-position')) {
                    const originalPosition = getComputedStyle(element).position;
                    element.setAttribute('data-original-position', originalPosition);
                  }
                  
                  // Get the original border width or set a default
                  const borderWidth = getComputedStyle(element).borderWidth === '0px' ? '1px' : getComputedStyle(element).borderWidth;
                  
                  // Create a precise gradient that follows the cursor position along the border
                  let gradientBorder;
                  
                  // Calculate the position for the radial gradient center
                  const gradientCenterX = percentX;
                  const gradientCenterY = percentY;
                  
                  // Create a radial gradient that's brightest at the cursor position
                  if (isOnTop || isOnBottom || isOnLeft || isOnRight) {
                    // Use a radial gradient with specific position
                    gradientBorder = \`radial-gradient(circle at \${gradientCenterX}% \${gradientCenterY}%, rgba(255,255,255,\${scaledIntensity}) 0%, rgba(255,255,255,0.05) \${Math.min(100, intensity * 300)}%)\`;
                  } else {
                    // Default case, should rarely happen
                    gradientBorder = \`rgba(255,255,255,\${scaledIntensity * 0.3})\`;
                  }
                  
                  // Create a border with varying brightness based on mouse position
                  // We'll use 4 separate border segments with different opacity values
                  
                  // Generate a unique ID for this element if it doesn't have one
                  if (!element.id) {
                    element.id = 'glass-element-' + Math.floor(Math.random() * 1000000);
                  }
                  
                  // Create or get the style element
                  const styleId = 'liquid-glass-styles';
                  let styleEl = document.getElementById(styleId);
                  
                  if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = styleId;
                    document.head.appendChild(styleEl);
                  }
                  
                  // Calculate brightness for each border side based on cursor proximity
                  // The closer the cursor is to a side, the brighter that side will be
                  const distToTop = Math.abs(mouseY - rect.top);
                  const distToRight = Math.abs(mouseX - rect.right);
                  const distToBottom = Math.abs(mouseY - rect.bottom);
                  const distToLeft = Math.abs(mouseX - rect.left);
                  
                  // Normalize distances to the effect range
                  const normDistTop = Math.min(distToTop / effectRange, 1);
                  const normDistRight = Math.min(distToRight / effectRange, 1);
                  const normDistBottom = Math.min(distToBottom / effectRange, 1);
                  const normDistLeft = Math.min(distToLeft / effectRange, 1);
                  
                  // Calculate brightness for each side (inverted - closer = brighter)
                  const topBrightness = minBrightness + ((1 - normDistTop) * (maxBrightness - minBrightness));
                  const rightBrightness = minBrightness + ((1 - normDistRight) * (maxBrightness - minBrightness));
                  const bottomBrightness = minBrightness + ((1 - normDistBottom) * (maxBrightness - minBrightness));
                  const leftBrightness = minBrightness + ((1 - normDistLeft) * (maxBrightness - minBrightness));
                  
                  // Add element to the set of active elements
                  activeElements.add(element.id);
                  
                  // Apply styles directly to the element for better performance
                  element.style.borderWidth = borderWidth;
                  element.style.borderStyle = 'solid';
                  element.style.borderTopColor = \`rgba(255,255,255,\${topBrightness})\`;
                  element.style.borderRightColor = \`rgba(255,255,255,\${rightBrightness})\`;
                  element.style.borderBottomColor = \`rgba(255,255,255,\${bottomBrightness})\`;
                  element.style.borderLeftColor = \`rgba(255,255,255,\${leftBrightness})\`;
                  
                  // Only set position if needed
                  if (getComputedStyle(element).position === 'static') {
                    element.style.position = 'relative';
                  }
                  
                  // Ensure the element has position relative
                  if (getComputedStyle(element).position === 'static') {
                    element.style.position = 'relative';
                  }
                  
                  // Preserve the original border-radius
                  const originalBorderRadius = getComputedStyle(element).borderRadius;
                  if (originalBorderRadius !== '0px') {
                    element.style.borderRadius = originalBorderRadius;
                  }
                  
                  // Create directional glow effects based on which sides are brightest
                  const glowSize = Math.round(intensity * 10);
                  
                  // Find the brightest side to determine primary glow direction
                  const brightnesses = [
                    { side: 'top', value: topBrightness },
                    { side: 'right', value: rightBrightness },
                    { side: 'bottom', value: bottomBrightness },
                    { side: 'left', value: leftBrightness }
                  ];
                  
                  // Sort by brightness (descending)
                  brightnesses.sort((a, b) => b.value - a.value);
                  
                  // Get the brightest side
                  const brightestSide = brightnesses[0].side;
                  
                  // Calculate shadow offset based on the brightest side
                  let shadowX = 0;
                  let shadowY = 0;
                  
                  // Determine shadow direction based on which side is brightest
                  if (brightestSide === 'top') {
                    shadowY = -glowSize * 0.5;
                  } else if (brightestSide === 'bottom') {
                    shadowY = glowSize * 0.5;
                  }
                  
                  if (brightestSide === 'left') {
                    shadowX = -glowSize * 0.5;
                  } else if (brightestSide === 'right') {
                    shadowX = glowSize * 0.5;
                  }
                  
                  // Calculate glow opacity based on the brightest side
                  const brightestValue = brightnesses[0].value;
                  const glowOpacity = brightestValue * 0.8;
                  
                  // Apply the directional shadow with an additional inset glow
                  const insetShadowX = -shadowX * 0.3;
                  const insetShadowY = -shadowY * 0.3;
                  const insetGlowSize = Math.max(1, Math.round(glowSize * 0.4));
                  const insetGlowOpacity = glowOpacity * 0.7;
                  
                  element.style.boxShadow = \`
                    \${shadowX}px \${shadowY}px \${glowSize}px rgba(255,255,255,\${glowOpacity}),
                    inset \${insetShadowX}px \${insetShadowY}px \${insetGlowSize}px rgba(255,255,255,\${insetGlowOpacity})
                  \`;
                  
                  // Add transition for smoother effect
                  element.style.transition = 'border-image 0.1s ease-out, box-shadow 0.1s ease-out';
                } else {
                  // Reset styles when cursor is far away
                  element.style.boxShadow = '';
                  
                  // Remove any CSS rules for this element
                  const styleEl = document.getElementById('liquid-glass-styles');
                  if (styleEl && element.id) {
                    // Remove only this element's rule by filtering out this element's ID
                    styleEl.textContent = styleEl.textContent.replace(new RegExp('#' + element.id + '\\s*\\{[^\\}]*\\}', 'g'), '');
                  }
                  
                  // Restore original position if needed
                  if (element.getAttribute('data-original-position')) {
                    element.style.position = element.getAttribute('data-original-position');
                    element.removeAttribute('data-original-position');
                  }
                  
                  // Restore original border style if we saved it
                  const originalBorderStyle = element.getAttribute('data-original-border');
                  if (originalBorderStyle) {
                    element.style.border = originalBorderStyle;
                  } else {
                    // Otherwise, just reset the border
                    element.style.border = '';
                  }
                }
                
                // Remove background effect from previous version
                element.style.background = '';
                element.style.filter = '';
              });
            }
            
            // Initial application
            if (isMouseMoving) {
              applyLiquidGlassBorderEffect();
            }
            
            console.log("Liquid glass border effect initialized with range:", effectRange, "px, brightness:", minBrightness, "to", maxBrightness);
          })();
        `;
      } else if (!liquidGlassEffect && liquidGlassScriptElement) {
        // Remove the script if the effect is disabled
        liquidGlassScriptElement.remove();
        
        // Also remove the style element if it exists
        const styleEl = document.getElementById('liquid-glass-styles');
        if (styleEl) {
          styleEl.remove();
        }
        
        // Reset any applied styles - only for elements that have our attributes
        const elements = document.querySelectorAll('[data-original-border], [data-original-position]');
        
        elements.forEach(element => {
          // Reset all style properties we've modified
          element.style.boxShadow = '';
          element.style.transition = '';
          element.style.borderTopColor = '';
          element.style.borderRightColor = '';
          element.style.borderBottomColor = '';
          element.style.borderLeftColor = '';
          element.style.borderWidth = '';
          element.style.borderStyle = '';
          
          // Restore original position if we saved it
          const originalPosition = element.getAttribute('data-original-position');
          if (originalPosition) {
            element.style.position = originalPosition;
            element.removeAttribute('data-original-position');
          }
          
          // Restore original border if we saved it
          const originalBorder = element.getAttribute('data-original-border');
          if (originalBorder) {
            element.style.border = originalBorder;
            element.removeAttribute('data-original-border');
          } else {
            element.style.border = '';
          }
        });
      }

      console.log("Liquid glass border effect updated successfully:", liquidGlassEffect ? "enabled" : "disabled");
    } catch (error) {
      console.error("Error applying liquid glass border effect:", error);
    }
  }, [liquidGlassEffect, glassEffectRange, glassEffectMaxBrightness, glassEffectMinBrightness]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    console.log("Toggle function called");
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      console.log("Toggling dark mode from", prevMode, "to", newMode);
      return newMode;
    });
  };

  // Update background image
  const updateBackgroundImage = (imageUrl) => {
    setBackgroundImage(imageUrl);
  };

  // Update background opacity
  const updateBackgroundOpacity = (opacity) => {
    setBackgroundOpacity(opacity);
  };

  // Update component opacity
  const updateComponentOpacity = (opacity) => {
    setComponentOpacity(opacity);
  };

  // Update blur level
  const updateBlurLevel = (level) => {
    setBlurLevel(level);
  };

  // Update blur type
  const updateBlurType = (type) => {
    setBlurType(type);
  };

  // Toggle custom cursor
  const toggleCustomCursor = () => {
    setCustomCursor(prev => !prev);
  };

  // Direct update for custom cursor
  const updateCustomCursor = (enabled) => {
    setCustomCursor(enabled);
  };

  // Toggle liquid glass effect
  const toggleLiquidGlassEffect = () => {
    setLiquidGlassEffect(prev => !prev);
  };

  // Direct update for liquid glass effect
  const updateLiquidGlassEffect = (enabled) => {
    setLiquidGlassEffect(enabled);
  };

  // Update glass effect range
  const updateGlassEffectRange = (range) => {
    setGlassEffectRange(range);
  };

  // Update glass effect max brightness
  const updateGlassEffectMaxBrightness = (brightness) => {
    setGlassEffectMaxBrightness(brightness);
  };

  // Update glass effect min brightness
  const updateGlassEffectMinBrightness = (brightness) => {
    setGlassEffectMinBrightness(brightness);
  };

  // Update menu type
  const updateMenuType = (type) => {
    setMenuType(type);
    localStorage.setItem('appMenuType', type);
  };

  console.log("ThemeProvider rendering with darkMode:", darkMode);

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode,
      backgroundImage,
      backgroundOpacity,
      updateBackgroundImage,
      updateBackgroundOpacity,
      componentOpacity,
      updateComponentOpacity,
      blurLevel,
      updateBlurLevel,
      blurType,
      updateBlurType,
      customCursor,
      toggleCustomCursor,
      updateCustomCursor,
      liquidGlassEffect,
      toggleLiquidGlassEffect,
      updateLiquidGlassEffect,
      updateGlassEffectRange,
      updateGlassEffectMaxBrightness,
      updateGlassEffectMinBrightness,
      menuType,
      updateMenuType
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 