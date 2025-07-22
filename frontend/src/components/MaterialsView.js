import React, { useState } from 'react';
import './MaterialsSearch.css';

const MaterialsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with actual API call
  const subjects = [
    { id: 'CEA201', title: 'Computer Organization', status: 'Active' },
    { id: 'CSI104', title: 'Connecting to Computer Networks', status: 'Active' },
    { id: 'MAE101', title: 'Mathematics for Engineering', status: 'Active' },
    { id: 'PRF192', title: 'Programming Fundamentals', status: 'Active' },
    { id: 'SSL101c', title: 'Academic Skills for University', status: 'Active' },
  ];
  
  const filteredSubjects = subjects.filter(subject => 
    subject.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    subject.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="materials-container p-6">
      <h1 className="text-2xl font-bold mb-4">Learning Materials</h1>
      
      <p className="materials-description text-gray-600">
        Access course materials organized by subject. Click on a subject to view its materials.
      </p>
      
      <div className="material-searchbar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search subjects by name, code, or type 'active'/'inactive'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="subject-list">
        {filteredSubjects.map(subject => (
          <div key={subject.id} className="subject-item">
            <h3 className="text-lg font-semibold">{subject.id}</h3>
            <p className="mt-2 text-gray-600">{subject.title}</p>
            <div className="mt-3">
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 ant-tag">
                {subject.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialsView; 