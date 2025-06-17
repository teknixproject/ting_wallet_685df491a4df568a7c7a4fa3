'use client';

import _ from 'lodash';
import React, { memo } from 'react';
import { RenderGrid, RenderSlice } from '../grid-systems';

interface TableProps {
  id?: string;
  style?: any;
  data?: any;
  styleDevice?: string;
}

const optionsRender: any = {
  thead: 'headers',
  tbody: 'bodies',
  tfoot: 'footers',
};

const Table = ({ style, data = {}, styleDevice }: TableProps) => {
  const tableConstructor = _.get(data, 'dataSlice.table');

  const styleTable = data?.dataSlice?.table?.style_table || {};

  return (
    <>
      <table
        style={{
          borderRadius: style?.borderRadius,
          border: `${styleTable?.borderWidth} ${styleTable?.borderStyle} ${styleTable?.borderColor}`,
        }}
        className="w-full border-collapse border-2 border-gray-500 font-sans text-sm tracking-wider"
      >
        {_.map(tableConstructor?.sectionOrder, (s) => {
          const rows = tableConstructor[optionsRender[s?.type]]
            ? _.find(tableConstructor[optionsRender[s?.type]], { id: s?.id })
            : {};
          if (s?.type === 'thead') {
            return (
              <thead
                style={{
                  backgroundColor: styleTable?.headerBackgroundColor,
                }}
                key={s?.id}
              >
                {_.map(rows?.rows, (row) => {
                  const cells = row?.cells;
                  return (
                    <tr key={row?.id} style={row?.style}>
                      {_.map(cells, (cell, index) => {
                        return (
                          <th
                            key={index}
                            scope={cell?.scope}
                            colSpan={cell?.colSpan}
                            rowSpan={cell?.rowSpan}
                            style={{
                              border: `${styleTable?.borderWidth} ${styleTable?.borderStyle} ${styleTable?.borderColor}`,
                              padding: styleTable?.cellPadding,
                              ...cell?.style_cell,
                            }}
                          >
                            <div style={cell?.[styleDevice as string]}>
                              {_.map(cell?.childs, (item) => (
                                <RenderSlice key={item.id} slice={item} idParent={row?.id} />
                              ))}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  );
                })}
              </thead>
            );
          }
          if (s?.type === 'tbody') {
            return (
              <tbody key={s?.id}>
                {_.map(rows?.rows, (row, index) => {
                  const cells = row?.cells;
                  return (
                    <tr key={index} style={row?.style}>
                      {_.map(cells, (cell, index) => {
                        return (
                          <td
                            key={index}
                            scope={cell?.scope}
                            colSpan={cell?.colSpan}
                            rowSpan={cell?.rowSpan}
                            style={{
                              border: `${styleTable?.borderWidth} ${styleTable?.borderStyle} ${styleTable?.borderColor}`,
                              padding: styleTable?.cellPadding,
                              ...cell?.style_cell,
                            }}
                          >
                            {_.map(cell?.childs, (item) => (
                              <RenderSlice key={item.id} slice={item} idParent={row?.id} />
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            );
          }
          if (s?.type === 'tfoot') {
            return (
              <tfoot key={s?.id}>
                {_.map(rows?.rows, (row, index) => {
                  const cells = row?.cells;
                  return (
                    <tr key={index} style={row?.style}>
                      {_.map(cells, (cell, index) => {
                        return (
                          <td
                            key={index}
                            scope={cell?.scope}
                            colSpan={cell?.colSpan}
                            rowSpan={cell?.rowSpan}
                            style={{
                              border: `${styleTable?.borderWidth} ${styleTable?.borderStyle} ${styleTable?.borderColor}`,
                              padding: styleTable?.cellPadding,
                              ...cell?.style_cell,
                            }}
                          >
                            {_.map(cell?.childs, (item) => (
                              <RenderGrid  key={item.id} slice={item} idParent={row?.id} items={[item]} />
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tfoot>
            );
          }
        })}
      </table>
    </>
  );
};

export default memo(Table);
