import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Tag, Space, Card, Divider } from 'antd';

/**
 * AntTagExample Component
 * Demonstrates how ant-tag elements maintain their original colors in dark mode
 * except when they're inside the material-searchbar
 */
const AntTagExample = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ant Tag Example in Dark Mode</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This example demonstrates how ant-tag elements maintain their original colors in dark mode
          unless they're inside the material-searchbar div.
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card title="Regular Ant Tags (Outside material-searchbar)" className="mb-6">
          <p className="mb-4">These tags will maintain their colors in dark mode:</p>
          
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
          
          <Divider />
          
          <p className="mb-2">Custom Tags:</p>
          <div>
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 ant-tag mr-2">
              Active
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 ant-tag mr-2">
              Inactive
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ant-tag">
              New
            </span>
          </div>
        </Card>
        
        <Card title="Tags in material-searchbar (Will Change in Dark Mode)" className="mb-6">
          <p className="mb-4">These tags will change color in dark mode because they're inside material-searchbar:</p>
          
          <div className="material-searchbar">
            <Space size="middle" wrap>
              <Tag color="magenta">magenta</Tag>
              <Tag color="red">red</Tag>
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
        </Card>
      </div>
      
      <Card title="How This Works">
        <p className="mb-2">CSS selectors exclude ant-tag elements in material-searchbar:</p>
        <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-4">
          {`.dark-mode .ant-tag:not(.material-searchbar .ant-tag) {
  background-color: inherit !important;
  color: inherit !important;
}`}
        </pre>
        
        <p className="mb-2">Applied to the materials view:</p>
        <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
          {`<div className="material-searchbar">
  <div className="search-container">
    <input type="text" ... />
  </div>
</div>

<div className="subject-item">
  <span className="ant-tag">Active</span> <!-- This tag maintains its color -->
</div>`}
        </pre>
      </Card>
    </div>
  );
};

export default AntTagExample; 