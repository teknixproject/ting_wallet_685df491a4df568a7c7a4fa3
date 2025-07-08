/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Button, Card, Checkbox, Collapse, Drawer, Dropdown, DropdownProps, Form, Image, Input,
  InputNumber, List, Modal, Radio, Select, Statistic, Table, TableProps, Tabs, Tag, Typography
} from 'antd';
import _ from 'lodash';
import { ReactNode } from 'react';

import { GridItem } from '@/types/gridItem';
import { getComponentType } from '@/uitls/component';
import { Bar, Column, Histogram, Line, Liquid, Pie, Radar, Rose, Stock } from '@ant-design/plots';

import ConfigMenu from './configComponent/ConfigMenu';
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
  const value = dataState || getData(data?.data, valueStream) || valueStream;
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
              <RenderSliceItem data={data.componentProps.columns} valueStream={item} />
            </List.Item>
          );
        },
      };
    case 'table':
      const configs: any = _.cloneDeep(data?.componentProps) || {}
      let summary = null
      if (configs.enableFooter && configs.footerColumns?.length > 0) {
        summary = () => (
          <Table.Summary>
            <Table.Summary.Row>
              {configs.footerColumns?.map((footer: any, index: any) => {
                return (
                  <Table.Summary.Cell
                    key={footer.key || index}
                    index={index}
                    align={footer?.align || 'left'}
                  >
                    <RenderSliceItem data={footer.box} />
                  </Table.Summary.Cell>
                )
              })}
            </Table.Summary.Row>
          </Table.Summary>
        )
      }
      return {
        ...data.componentProps,
        dataSource: _.isArray(value) ? value : data.componentProps?.dataSource,
        columns: data?.componentProps?.columns?.map((item: any) => {
          return {
            ...item,
            render: (value: any) => <RenderSliceItem data={item.box} valueStream={value} />,
          };
        },
        ),
        summary

      } as TableProps;
    case 'modal': {
      return {
        ...data.componentProps,
        open: value,
      };
    }
    case 'drawer': {
      return { ...data.componentProps, open: value };
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
