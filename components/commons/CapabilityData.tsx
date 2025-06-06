/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { format, isValid } from 'date-fns';
import _ from 'lodash';
import React, { MouseEventHandler, useState } from 'react';

interface OnClickProps {
  id?: string;
  style?: React.CSSProperties;
  className?: string;
  data?: any[];
  items?: any[];
  onClickRow?: MouseEventHandler<HTMLTableRowElement> | undefined;
  onClickMenu?: MouseEventHandler<HTMLButtonElement> | undefined;
  onClickPagination?: MouseEventHandler<HTMLButtonElement> | undefined;
  title?: string;
}

type CapabilityData = {
  capabillity_type?: string;
  instance_name?: string;
  namespace?: string;
  creation_date?: string;
  status?: string;
};

const CapabilityTable: React.FC<OnClickProps> = ({
  id,
  style,
  className,
  data,
  onClickRow,
  onClickMenu,
  onClickPagination,
  title,
}) => {
  // Safe data handling
  const safeData = _.isArray(data) ? data : [];
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalItems = safeData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = safeData.slice(startIndex, endIndex);

  // Format date or return 'Invalid Date' if not valid
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid Date';
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Status badge component
  const StatusBadge = ({ status }: { status?: string }) => {
    const safeStatus = status?.toLowerCase() ?? '';

    if (safeStatus === 'running') {
      return (
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span>Running</span>
        </div>
      );
    } else if (safeStatus === 'not ready') {
      return (
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 text-amber-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span>Not ready</span>
        </div>
      );
    }

    return <span>{status}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" id={id} style={style}>
      {title}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Capability type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Instance name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Namespace
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Creation date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item: CapabilityData, index: number) => (
              <tr
                key={`${item?.instance_name ?? ''}${index}`}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={(e) => onClickRow?.(e)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item?.capabillity_type ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="text-blue-500 hover:text-blue-700">
                    {item?.instance_name ?? '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item?.namespace ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item?.creation_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <StatusBadge status={item?.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickMenu?.(e);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <span className="text-sm text-gray-700">
            Items per page:
            <select
              className="mx-2 border-gray-300 rounded-md"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </span>
          <span className="text-sm text-gray-700">
            {`${startIndex + 1}–${Math.min(endIndex, totalItems)} of ${totalItems} items`}
          </span>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-700">{`of ${totalPages} pages`}</span>
          <div className="flex">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapabilityTable;
