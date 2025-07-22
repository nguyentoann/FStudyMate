import React, { useState } from 'react';

const SearchBar = ({ placeholder = "Search...", onSearch, className = "" }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSearch} role="search">
        <input
          type="search"
          placeholder={placeholder}
          className="w-full pl-4 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button type="submit" className="sr-only">Search</button>
      </form>
    </div>
  );
};

export default SearchBar; 