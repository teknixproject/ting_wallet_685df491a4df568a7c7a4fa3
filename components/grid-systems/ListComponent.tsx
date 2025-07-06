/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Button,
  Card,
  Checkbox,
  Collapse,
  Drawer,
  Dropdown,
  DropdownProps,
  Form,
  Image,
  Input,
  InputNumber,
  List,
  Modal,
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

import ConfigMenu from './configComponent/ConfigMenu';
import { getStyleOfDevice } from './DataProvider';
import RenderSliceItem from './RenderSliceItem';
import ConfigModal from './configComponent/ConfigModal';

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
  menu: ConfigMenu,
  modal: Modal,
  drawer: Drawer,
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
  if (!data) return {};
  const value = dataState || getData(data?.data, valueStream) || valueStream || data?.name;
  console.log(`🚀 ~ value: ${data.id}`, value);
  const valueType = data?.value?.toLowerCase();
  const { isInput, isChart, isUseOptionsData } = getComponentType(valueType || '');
  switch (valueType) {
    case 'tabs':
      return {
        ...data.componentProps,
        items: data?.componentProps?.items?.map((item: any) => {
          return {
            ...item,
            children: (
              <RenderSliceItem data={item.children} valueStream={valueStream?.[item.key]} />
            ),
          };
        }),
      };

    case 'dropdown':
      return {
        ...data.componentProps,
        menu: {
          items: value,
        },
        children: <Button>{data?.componentProps?.label || getName(data.id)}</Button>,
      } as DropdownProps;
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
    case 'modal': {
      console.log('data.componentProps', data.componentProps);

      return {
        ...data.componentProps
      }
    }
    case 'drawer': {
      console.log('drawer', data.componentProps);

      return {
        ...data.componentProps
      }
    }
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
    <List pagination={{}} />
    {children}
  </a>
);
