import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Table } from 'antd';

const TableDarkModeDemo = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Sample data for the Ant Design table
  const antColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];
  
  const antData = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sydney No. 1 Lake Park',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Table Dark Mode Demo</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This demo shows how all table headers follow dark mode styling.
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
        {/* Ant Design Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ant Design Table</h2>
          <Table 
            columns={antColumns} 
            dataSource={antData}
            pagination={false}
            className="mb-8"
          />
        </div>
        
        {/* HTML Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Standard HTML Table</h2>
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">John Brown</td>
                <td className="px-6 py-4 whitespace-nowrap">32</td>
                <td className="px-6 py-4 whitespace-nowrap">New York No. 1 Lake Park</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Jim Green</td>
                <td className="px-6 py-4 whitespace-nowrap">42</td>
                <td className="px-6 py-4 whitespace-nowrap">London No. 1 Lake Park</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Joe Black</td>
                <td className="px-6 py-4 whitespace-nowrap">32</td>
                <td className="px-6 py-4 whitespace-nowrap">Sydney No. 1 Lake Park</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Custom Table with header-row class */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Custom Table with Header Classes</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="header-row grid grid-cols-3 bg-gray-100 font-semibold">
              <div className="px-6 py-3">Name</div>
              <div className="px-6 py-3">Age</div>
              <div className="px-6 py-3">Address</div>
            </div>
            <div className="bg-white">
              <div className="grid grid-cols-3 border-t px-6 py-3">
                <div>John Brown</div>
                <div>32</div>
                <div>New York No. 1 Lake Park</div>
              </div>
              <div className="grid grid-cols-3 border-t px-6 py-3">
                <div>Jim Green</div>
                <div>42</div>
                <div>London No. 1 Lake Park</div>
              </div>
              <div className="grid grid-cols-3 border-t px-6 py-3">
                <div>Joe Black</div>
                <div>32</div>
                <div>Sydney No. 1 Lake Park</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">CSS Rules Applied</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
{`/* All table header elements follow dark mode */
body.dark-mode thead,
body.dark-mode th,
body.dark-mode .ant-table-thead > tr > th,
body.dark-mode [class*="ant-table-thead"],
body.dark-mode .ant-table-thead th.ant-table-column-sort,
body.dark-mode th.ant-table-cell,
body.dark-mode table > thead > tr > th,
body.dark-mode table thead tr th,
body.dark-mode .table-header,
body.dark-mode [class*="table-header"],
body.dark-mode [class*="header-row"] {
  background-color: #1e293b !important;
  color: #f3f4f6 !important;
  border-color: #475569 !important;
}

/* Make sure all table header text is visible */
body.dark-mode thead *,
body.dark-mode th *,
body.dark-mode .ant-table-thead > tr > th *,
body.dark-mode [class*="ant-table-thead"] *,
body.dark-mode .table-header *,
body.dark-mode [class*="header-row"] * {
  color: #f3f4f6 !important;
}`}
        </pre>
      </div>
    </div>
  );
};

export default TableDarkModeDemo; 