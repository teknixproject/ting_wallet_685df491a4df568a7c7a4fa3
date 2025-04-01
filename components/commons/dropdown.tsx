'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react/dist/iconify.js';
import _ from 'lodash';

interface DropdownProps {
  id: string;
  style?: any;
  data?: any;
  childs?: any[];
  menuClassDropdow?: any;
}

const Dropdown: React.FC<DropdownProps> = ({
  id,
  style = '',
  data = {},
  childs = [],
  menuClassDropdow,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Tạo ref để tham chiếu đến phần tử dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  const buttonSelectedClass = style?.dropdownStyles?.buttonSelected
    ? style.dropdownStyles.buttonSelected.toString()
    : '';
  const menuClass = style?.dropdownStyles?.menu ? style.dropdownStyles.menu.toString() : '';
  const buttonChildClass = style?.dropdownStyles?.button
    ? style.dropdownStyles.button.toString()
    : '';

  // Lắng nghe sự kiện click bên ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (item: any) => {
    if (item?.value === 'button' && item?.action?.type === 'navigate') {
      console.log(`Navigating to page: ${item.action.pageId}`);
    }
    setSelectedItem(item?.name || null);
    setIsOpen(false);
  };

  const renderChild = (child: any) => {
    if (!child || !child.value) return null;

    switch (child.value) {
      case 'button':
        return (
          <button
            onClick={() => handleItemClick(child)}
            className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors ${buttonChildClass}`}
          >
            {_.get(child, 'dataSlice.title') || 'Unnamed Button'}
          </button>
        );
      case 'text':
        return (
          <div className={`px-4 py-2 text-gray-700 ${buttonChildClass}`}>
            {_.get(child, 'dataSlice.title') || 'Unnamed Text'}
          </div>
        );
      case 'dropdown':
        return (
          <Dropdown
            id={child.id || `${id}-child-${Math.random()}`}
            style={child.style || ''}
            data={child || {}}
            childs={child.childs || []}
            menuClassDropdow={menuClass}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={dropdownRef} className={cn(`relative inline-block`, menuClassDropdow)}>
      <button
        onClick={handleToggle}
        className={`transition-colors flex items-center gap-2 focus:bg-[##ffffff47] ${buttonSelectedClass}`}
      >
        {selectedItem || data?.name || 'Dropdown'}
        <span>
          {isOpen ? (
            <Icon icon="iconamoon:arrow-up-2" width="24" height="24" />
          ) : (
            <Icon icon="iconamoon:arrow-down-2" width="24" height="24" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className={cn('absolute left-0 mt-2 z-10', menuClass)}>
          {childs.length > 0 ? (
            childs.map((item: any, index: number) => (
              <div key={item?.id || index}>{renderChild(item)}</div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No items</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
