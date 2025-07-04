/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Card,
  Checkbox,
  Collapse,
  Drawer,
  Dropdown,
  Form,
  Image,
  Input,
  InputNumber,
  List,
  Radio,
  Select,
  Statistic,
  Table,
  TableProps,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import _ from 'lodash';
import { ReactNode } from 'react';

import { GridItem } from '@/types/gridItem';
import { getComponentType } from '@/uitls/component';
import { Bar, Column, Histogram, Line, Liquid, Pie, Radar, Rose, Stock } from '@ant-design/plots';

import NavigationMenu from './configComponent/ConfigMenu';
import { getStyleOfDevice } from './DataProvider';
import RenderSliceItem from './RenderSliceItem';

export const componentRegistry = {
  button: Button,
  text: Typography.Text,
  link: Typography.Link,
  title: Typography.Title,
  paragraph: Typography.Paragraph,
  image: Image,
  list: List,
  inputtext: Input,
  inputnumber: InputNumber,
  table: Table,
  checkbox: Checkbox,
  radio: Radio,
  select: Select,
  form: Form,
  formitem: Form.Item,
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
  menu: NavigationMenu,
};

export const convertProps = ({
  data,
  getData,
  dataState,
  valueStream,
}: {
  data: GridItem;
  getData: any;
  dataState?: any;
  valueStream?: any;
}) => {
  const value = dataState || getData(data.data, valueStream) || valueStream || data.name;
  const valueType = data?.value?.toLowerCase();
  const { isInput, isChart, isUseOptionsData } = getComponentType(valueType || '');
  switch (valueType) {
    case 'image':
      return {
        ...data.componentProps,
        src: value,
      };
    case 'list':
      return {
        ...data.componentProps,
        dataSource: _.isArray(value) ? value : data.componentProps.dataSource,
        renderItem: (item: any) => {
          return (
            <List.Item>
              <RenderSliceItem data={data.componentProps.box} valueStream={item} />
            </List.Item>
          );
        },
      };
    case 'table':
      return {
        ...data.componentProps,
        dataSource: _.isArray(value) ? value : data.componentProps.dataSource,
        columns: data?.componentProps?.columns?.map((item: any) => {
          return {
            ...item,
            render: (value: any) => <RenderSliceItem data={item.box} valueStream={value} />,
          };
        }),
      } as TableProps;
    default:
      break;
  }
  if (isUseOptionsData) {
    return {
      ...data.componentProps,
      options: value,
    };
  }
  if (isInput) {
    return {
      ...data.componentProps,
      style: { ...getStyleOfDevice(data), ...data?.componentProps?.style },
      value: value,
    };
  }
  if (isChart) {
    return {
      ...data.componentProps,
      data: value,
      style: { ...getStyleOfDevice(data), ...data?.componentProps?.style },
    };
  }
  return {
    ...data.componentProps,

    style: { ...getStyleOfDevice(data), ...data?.componentProps?.style },
    children: value,
  };
};
export const getName = (id: string) => id.split('$')[0];
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
