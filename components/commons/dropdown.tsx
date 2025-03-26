'use client';

import React, { useState } from 'react';

interface DropdownProps {
  id: string;
  style?: string;
  data?: any;
  childs?: any[];
}

const Dropdown: React.FC<DropdownProps> = ({ id, style = '', data = {}, childs = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  console.log('Dropdown', {
    id,
    style,
    data,
    childs,
  });

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
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {child.name || 'Unnamed Button'}
          </button>
        );
      case 'text':
        return <div className="px-4 py-2 text-gray-700">{child.name || 'Unnamed Text'}</div>;
      case 'dropdown':
        return (
          <Dropdown
            id={child.id || `${id}-child-${Math.random()}`}
            style={child.style || ''}
            data={child || {}}
            childs={child.childs || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggle}
        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 ${style}`}
      >
        {selectedItem || data?.name || 'Dropdown'}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
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
