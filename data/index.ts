export const dataSample = `use client';

import { useState, useRef, useEffect } from 'react';
import { FiMenu, FiSettings, FiSearch, FiCalendar, FiMoreVertical, FiUser, FiX } from 'react-icons/fi';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [title, setTitle] = useState('Title');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const closeSearch = () => {
    setShowSearch(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiMenu className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiSettings className="w-5 h-5 text-gray-700" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center font-medium text-gray-800 px-2"
              onClick={toggleDropdown}
            >
              {title} <span className="ml-1">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md py-1 w-48 z-10">
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setTitle('Project 1');
                    setIsDropdownOpen(false);
                  }}
                >
                  Project 1
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setTitle('Project 2');
                    setIsDropdownOpen(false);
                  }}
                >
                  Project 2
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100" onClick={toggleSearch}>
            <FiSearch className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiCalendar className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiMoreVertical className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiUser className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="bg-blue-800 px-4 py-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-10 py-2 bg-white rounded-md focus:outline-none"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button onClick={closeSearch}>
                <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
          <h2 className="text-white text-xl font-medium mt-4">
            {title}
          </h2>
        </div>
      )}
    </div>
  );
};

export default Header;`;
