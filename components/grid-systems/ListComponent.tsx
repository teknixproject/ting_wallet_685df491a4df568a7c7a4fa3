/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Button, Card, Checkbox, Collapse, Drawer, Dropdown, Form, Image, Input, List, Radio, Select,
    Statistic, Table, Tabs, Tag, Typography
} from 'antd';
import _ from 'lodash';
import { ReactNode } from 'react';

import { GridItem } from '@/types/gridItem';
import { Bar, Column, Histogram, Line, Liquid, Pie, Radar, Rose, Stock } from '@ant-design/plots';

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
  table: Table,
  checkbox: Checkbox,
  radio: Radio,
  select: Select,
  form: Form,
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

export const convertProps = ({
  data,
  findVariable,
  dataState,
}: {
  data: GridItem;
  findVariable: any;
  dataState?: any;
}) => {
  const value = 'test';
  const valueType = data?.value?.toLowerCase();
  switch (valueType) {
    case 'list':
      return {
        ...data.componentProps,
        dataSource: _.isArray(dataState) ? dataState : [],
        renderItem: (item: any) => {
          // const box = data?.componentProps?.box;
          // if (!box?.data) return <div>{item}</div>;
          return (
            <List.Item>
              <RenderSliceItem data={data.componentProps.box} valueStream={item} />
            </List.Item>
          );
        },
      };

    default:
      break;
  }
  return {
    ...data.componentProps,
    style: { ...getStyleOfDevice(data), ...data?.componentProps?.style },
    children: value || getName(data?.id),
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
