import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Progress, Card, Row, Col } from 'antd';

const ProgressBarSubjectCodeDemo = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [progress, setProgress] = useState(75);

  // Sample subject codes
  const subjectCodes = [
    { code: 'CS101', name: 'Introduction to Computer Science' },
    { code: 'MATH202', name: 'Advanced Calculus' },
    { code: 'PHY301', name: 'Quantum Physics' },
    { code: 'BIO250', name: 'Molecular Biology' },
    { code: 'ENG105', name: 'Academic Writing' }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Progress Bars and Subject Codes in Dark Mode</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This demo shows how progress bars are fixed to display properly in dark mode and how subject codes maintain their styling.
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

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Progress Bars" className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Overall Progress (Preserved Colors)</h3>
            <div className="mb-6">
              <div className="mb-1">Standard Overall Progress</div>
              <Progress 
                percent={progress} 
                className="overall-progress" 
                strokeColor="#52c41a" // Green color
                data-label="Overall Progress" 
              />
              
              <div className="mt-4 mb-1">Overall Progress with Title</div>
              <Progress 
                percent={progress} 
                title="Overall Progress" 
                strokeColor="#722ed1" // Purple color
              />
              
              <div className="mt-4 mb-1">Overall Progress with Aria Label</div>
              <Progress 
                percent={progress} 
                aria-label="Overall Progress Bar" 
                strokeColor="#f5222d" // Red color
              />
              
              <div className="mt-4 mb-1">Custom Overall Progress</div>
              <div 
                className="progress-bar w-full h-4 bg-gray-200 rounded-full overflow-hidden"
                data-label="Overall"
              >
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${progress}%` }} 
                  role="progressbar" 
                  aria-valuenow={progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="text-right text-sm">{progress}%</div>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">Regular Progress Bars (Dark Mode Styled)</h3>
            <div className="mb-6">
              <Progress percent={progress} />
              <Progress percent={progress} status="active" />
              <Progress percent={progress} status="success" />
              <Progress percent={progress} status="exception" />
              <Progress type="circle" percent={progress} className="mr-4" />
              <Progress type="dashboard" percent={progress} />
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Subject Codes" className="mb-6">
            <p className="mb-4">
              Subject codes should maintain their original styling in dark mode.
            </p>
            
            <div className="space-y-4">
              {subjectCodes.map((subject, index) => (
                <div key={index} className="p-3 border rounded">
                  <span className="subject-code inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded mr-2">
                    {subject.code}
                  </span>
                  <span>{subject.name}</span>
                </div>
              ))}
              
              <div className="p-3 border rounded">
                <span className="inline-block" data-type="subject-code">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded mr-2">
                    CHEM110
                  </span>
                </span>
                <span>General Chemistry</span>
              </div>
              
              <div className="p-3 border rounded">
                <span className="subject-code-display inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded mr-2">
                  ART220
                </span>
                <span>Contemporary Art History</span>
              </div>
              
              <div className="p-3 border rounded">
                <span className="subjectCode inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded mr-2">
                  ECON101
                </span>
                <span>Principles of Economics</span>
              </div>
              
              <div className="p-3 border rounded">
                <span data-subject-code className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded mr-2">
                  PSYCH250
                </span>
                <span>Developmental Psychology</span>
              </div>
              
              <div className="p-3 border rounded">
                <div className="subject-code">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded mr-2">
                    SOC330
                  </span>
                  <span className="text-gray-600">(Advanced)</span>
                </div>
                <span>Social Research Methods</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="p-6 bg-white rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">Updated CSS Rules</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
{`/* Subject codes should not change color in dark mode - stronger selectors */
body.dark-mode .subject-code,
body.dark-mode [class*="subject-code"],
body.dark-mode [class*="subjectCode"],
body.dark-mode [data-type="subject-code"],
body.dark-mode [data-subject-code],
body.dark-mode span[class*="subject-code"],
body.dark-mode div[class*="subject-code"],
body.dark-mode .subject-code *,
body.dark-mode [class*="subject-code"] *,
body.dark-mode [class*="subjectCode"] *,
body.dark-mode [data-type="subject-code"] * {
  color: inherit !important;
  background-color: inherit !important;
  border-color: inherit !important;
}

/* Preserve Overall Progress bar colors */
body.dark-mode .overall-progress,
body.dark-mode [class*="overall-progress"],
body.dark-mode [class*="overallProgress"],
body.dark-mode [data-progress-type="overall"],
body.dark-mode [aria-label*="Overall Progress"],
body.dark-mode [title*="Overall Progress"],
body.dark-mode .progress-bar[data-label*="Overall"],
body.dark-mode .ant-progress[data-label*="Overall"],
body.dark-mode [class*="progress"][data-label*="Overall"] {
  background-color: inherit !important;
}

body.dark-mode .overall-progress > div,
body.dark-mode [class*="overall-progress"] > div,
body.dark-mode [class*="overallProgress"] > div,
body.dark-mode [data-progress-type="overall"] > div,
body.dark-mode [aria-label*="Overall Progress"] > div,
body.dark-mode [title*="Overall Progress"] > div,
body.dark-mode .progress-bar[data-label*="Overall"] > div,
body.dark-mode .ant-progress-bg[data-label*="Overall"],
body.dark-mode .ant-progress[data-label*="Overall"] .ant-progress-bg {
  background-color: inherit !important;
  color: inherit !important;
}`}
        </pre>
      </div>
    </div>
  );
};

export default ProgressBarSubjectCodeDemo; 