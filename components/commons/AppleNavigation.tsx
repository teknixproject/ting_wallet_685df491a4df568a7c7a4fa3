/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { MouseEventHandler, useState } from 'react';
import _ from 'lodash';

interface OnClickProps {
  id?: string;
  style?: React.CSSProperties;
  className?: string;
  data?: any;
  items?: any[];
  onClickApple?: MouseEventHandler<HTMLElement> | undefined;
  onClickCuaHang?: MouseEventHandler<HTMLElement> | undefined;
  onClickMac?: MouseEventHandler<HTMLElement> | undefined;
  onClickIPad?: MouseEventHandler<HTMLElement> | undefined;
  onClickIPhone?: MouseEventHandler<HTMLElement> | undefined;
  onClickWatch?: MouseEventHandler<HTMLElement> | undefined;
  onClickAirPods?: MouseEventHandler<HTMLElement> | undefined;
  onClickTVNha?: MouseEventHandler<HTMLElement> | undefined;
  onClickGiaiTri?: MouseEventHandler<HTMLElement> | undefined;
  onClickPhuKien?: MouseEventHandler<HTMLElement> | undefined;
  onClickHoTro?: MouseEventHandler<HTMLElement> | undefined;
  onClickSearch?: MouseEventHandler<HTMLElement> | undefined;
  onClickCart?: MouseEventHandler<HTMLElement> | undefined;
  onClickHome?: MouseEventHandler<HTMLElement> | undefined;
  onClickAbout?: MouseEventHandler<HTMLElement> | undefined;
  onClickContact?: MouseEventHandler<HTMLElement> | undefined;
  onClickSupport?: MouseEventHandler<HTMLElement> | undefined;
  onClickHTML?: MouseEventHandler<HTMLElement> | undefined;
  onClickCSS?: MouseEventHandler<HTMLElement> | undefined;
  onClickJavascript?: MouseEventHandler<HTMLElement> | undefined;
  onClickIcon?: MouseEventHandler<HTMLElement> | undefined;
}

const AppleNavigation: React.FC<OnClickProps> = ({
  id,
  style,
  className,
  data,
  items,
  onClickApple,
  onClickCuaHang,
  onClickMac,
  onClickIPad,
  onClickIPhone,
  onClickWatch,
  onClickAirPods,
  onClickTVNha,
  onClickGiaiTri,
  onClickPhuKien,
  onClickHoTro,
  onClickSearch,
  onClickCart,
  onClickHome,
  onClickAbout,
  onClickContact,
  onClickSupport,
  onClickHTML,
  onClickCSS,
  onClickJavascript,
  onClickIcon,
  ...props
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const topNavItems = [
    { label: 'Cửa Hàng', onClick: onClickCuaHang },
    { label: 'Mac', onClick: onClickMac },
    { label: 'iPad', onClick: onClickIPad },
    { label: 'iPhone', onClick: onClickIPhone },
    { label: 'Watch', onClick: onClickWatch },
    { label: 'AirPods', onClick: onClickAirPods },
    { label: 'TV & Nhà', onClick: onClickTVNha },
    { label: 'Giải Trí', onClick: onClickGiaiTri },
    { label: 'Phụ Kiện', onClick: onClickPhuKien },
    { label: 'Hỗ Trợ', onClick: onClickHoTro },
  ];

  const bottomNavItems = [
    { label: 'Home', onClick: onClickHome },
    { label: 'About', onClick: onClickAbout },
    { label: 'Contact', onClick: onClickContact },
    { label: 'Support', onClick: onClickSupport },
  ];

  const dropdownItems = [
    { label: 'HTML', onClick: onClickHTML },
    { label: 'CSS', onClick: onClickCSS },
    { label: 'Javascript', onClick: onClickJavascript },
    { label: 'Icon', onClick: onClickIcon },
  ];

  const handleAppleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClickApple?.(event);
  };

  const handleSearchClick = (event: React.MouseEvent<HTMLElement>) => {
    setIsDropdownOpen(!isDropdownOpen);
    onClickSearch?.(event);
  };

  const handleCartClick = (event: React.MouseEvent<HTMLElement>) => {
    onClickCart?.(event);
  };

  const handleNavItemClick = (onClick?: MouseEventHandler<HTMLElement>) => (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event);
  };

  return (
    <div className={`w-full ${className ?? ''}`} id={id} style={style}>
      {/* Top Navigation */}
      <nav className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Apple Logo */}
            <div className="flex items-center">
              <button 
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                onClick={handleAppleClick}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </button>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-8">
              {topNavItems.map((item, index) => (
                <button
                  key={index}
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  onClick={handleNavItemClick(item.onClick)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              <button 
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                onClick={handleSearchClick}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button 
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                onClick={handleCartClick}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation with Dropdown */}
      <div className="relative">
        <nav className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Navigation Items */}
              <div className="flex items-center space-x-12">
                {bottomNavItems.map((item, index) => (
                  <button
                    key={index}
                    className="text-white font-medium hover:text-pink-100 transition-colors duration-200"
                    onClick={handleNavItemClick(item.onClick)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Search Icon with Dropdown */}
              <div className="relative">
                <button 
                  className="text-white hover:text-pink-100 transition-colors duration-200 p-2"
                  onClick={handleSearchClick}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-pink-500 rounded-lg shadow-lg border border-pink-400 z-10">
                    <div className="py-2">
                      {dropdownItems.map((item, index) => (
                        <button
                          key={index}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-pink-600 transition-colors duration-200"
                          onClick={handleNavItemClick(item.onClick)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AppleNavigation;