import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Tag, Space, Card, Divider } from 'antd';

/**
 * AntTagPreserveDemo Component
 * Demonstrates how ALL ant-tag elements maintain their original colors in dark mode
 * regardless of where they are in the page structure
 */
const AntTagPreserveDemo = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ant Tag Preservation in Dark Mode</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This demo shows how ant-tag elements maintain their original colors in dark mode
          regardless of where they're positioned in the page.
          <br />
          Current mode: <strong>{darkMode ? 'Dark' : 'Light'}</strong>
        </p>
        
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Toggle Dark Mode
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card title="Ant Tags Everywhere - All Preserve Their Colors" className="mb-6">
          <p className="mb-4">These tags will maintain their colors in dark mode regardless of location:</p>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Standard Ant Design Tags</h3>
            <Space size="middle" wrap>
              <Tag color="magenta">magenta</Tag>
              <Tag color="red">red</Tag>
              <Tag color="volcano">volcano</Tag>
              <Tag color="orange">orange</Tag>
              <Tag color="gold">gold</Tag>
              <Tag color="lime">lime</Tag>
              <Tag color="green">green</Tag>
              <Tag color="cyan">cyan</Tag>
              <Tag color="blue">blue</Tag>
              <Tag color="geekblue">geekblue</Tag>
              <Tag color="purple">purple</Tag>
            </Space>
          </div>
          
          <Divider />
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Inside Material Searchbar</h3>
            <div className="material-searchbar p-4 border rounded-lg">
              <p className="mb-2">Material Searchbar Container:</p>
              <Space size="middle" wrap>
                <Tag color="magenta">magenta</Tag>
                <Tag color="blue">blue</Tag>
                <Tag color="green">green</Tag>
              </Space>
              
              <div className="mt-4">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 ant-tag mr-2">
                  Active
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 ant-tag">
                  Inactive
                </span>
              </div>
            </div>
          </div>
          
          <Divider />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Custom Styled Tags</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 ant-tag">
                Active
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 ant-tag">
                Inactive
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ant-tag">
                New
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 ant-tag">
                Featured
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 ant-tag">
                Warning
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      <Card title="How It Works" className="mb-6">
        <p className="mb-2">CSS selectors target ALL ant-tag elements regardless of their location:</p>
        <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto text-xs mb-4">
          {`/* Rules for ALL ant-tag elements to retain their colors in dark mode - no exceptions */
body.dark-mode .ant-tag,
body.dark-mode span.ant-tag,
body.dark-mode [class*="ant-tag"],
body.dark-mode div .ant-tag,
body.dark-mode .material-searchbar .ant-tag {
  background-color: inherit !important;
  color: inherit !important;
  border-color: inherit !important;
}`}
        </pre>
        
        <p className="mb-2">Usage in the materials page:</p>
        <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto text-xs">
          {`<div className="subject-item">
  <h3 className="text-lg font-semibold">{subject.id}</h3>
  <p className="mt-2 text-gray-600">{subject.title}</p>
  <div className="mt-3">
    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 ant-tag">
      {subject.status}
    </span>
  </div>
</div>`}
        </pre>
      </Card>
      
      <Card title="Other Dark Mode Elements">
        <p>This card's background changes in dark mode, but the tags below don't:</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag color="blue">Preserved Tag</Tag>
          <Tag color="green">Also Preserved</Tag>
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 ant-tag">
            Custom Preserved
          </span>
        </div>
      </Card>
    </div>
  );
};

export default AntTagPreserveDemo; 