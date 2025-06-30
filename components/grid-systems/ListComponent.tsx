/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Card,
  Collapse,
  Drawer,
  Dropdown,
  Image,
  Input,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { ReactNode } from 'react';

import { GridItem } from '@/types/gridItem';
import { Bar, Column, Histogram, Line, Liquid, Pie, Radar, Rose, Stock } from '@ant-design/plots';

import { getStyleOfDevice } from './DataProvider';

export const componentRegistry = {
  button: Button,
  text: Typography.Text,
  link: Typography.Link,
  title: Typography.Title,
  paragraph: Typography.Paragraph,
  image: Image,
  inputtext: Input,
  table: Table,
  collapse: Collapse,
  tag: Tag,
  tabs: Tabs,
  dropdown: Dropdown,
  card: Card,
  drawer: Drawer,
  statistic: Statistic,
  linechart: Line,
  columnchart: Column,
  piechart: Pie,
  barchart: Bar,
  histogramchart: Histogram,
  liquidchart: Liquid,
  radarchart: Radar,
  rosechart: Rose,
  stockchart: Stock,
};

// const renderData = (data: TData, findVariable, id) => {
//   const stateValue = () => {
//     const variable = findVariable({
//       type: data.type,
//       id: (data[data.type] as any).variableId,
//     });
//     return `[${variable?.key}]`;
//   };
//   if (!data) return id.split('$')[0];
//   switch (data?.type) {
//     case 'combineText':
//       return data.combineText;
//     case 'valueInput':
//       return data.valueInput;
//     case 'apiResponse':
//       return stateValue();
//     case 'appState':
//       return stateValue();
//     case 'componentState':
//       return stateValue();
//     case 'globalState':
//       return stateValue();

//     default:
//       return data.defaultValue || `[${data.type}]` || id.split('$')[0];
//   }
// };
export const convertProps = ({ data, findVariable }: { data: GridItem; findVariable: any }) => {
  const value = 'test';
  const valueType = data?.value?.toLowerCase();
  if (valueType?.includes('chart'))
    return {
      // data: {
      //   type: 'fetch',
      //   value: 'https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json',
      // },
      // xField: (d: any) => new Date(d.year),
      // yField: 'value',
      // sizeField: 'value',
      // shapeField: 'trail',
      // legend: { size: false },
      // colorField: 'category',
      ...data.componentProps,
    };
  return {
    ...data.componentProps,
    style: { ...getStyleOfDevice(data), ...data?.componentProps?.style },
    children: value || getName(data?.id),
  };
};
const getName = (id: string) => id.split('$')[0];
const wrapWithAnchor = (children: ReactNode = 'Click me') => (
  <a
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    {children}
  </a>
);
