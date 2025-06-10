/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';

import { TCustomFunction, TTypeVariable } from '@/types';
import { TData } from '@/types/dataItem';

function convertValueByType(value: any, type: TTypeVariable, isList = false): any {
  if (value == null) return null;

  const parseOne = (v: any) => {
    switch (type.toLowerCase()) {
      case 'string':
        return String(v);
      case 'integer':
        return parseInt(v, 10);
      case 'float':
        return parseFloat(v);
      case 'boolean':
        return v === 'true' || v === true;
      case 'date':
        return new Date(v);
      case 'object':
        try {
          return typeof v === 'object' ? v : JSON.parse(v);
        } catch {
          return null;
        }
      default:
        return v;
    }
  };

  if (isList) {
    try {
      const arr = Array.isArray(value) ? value : JSON.parse(value);
      return arr.map(parseOne);
    } catch {
      return [];
    }
  }

  return parseOne(value);
}

type THandleCustomData = {
  data: TData['customFunction'];
  getData: (data: TData | null) => any;
  findCustomFunction: (id: string) => TCustomFunction;
};
export const handleCustomFunction = ({
  data,
  getData,
  findCustomFunction,
}: THandleCustomData): any => {
  function buildArgsFromDefinedProps(
    props: TCustomFunction['props'],
    inputs: TData['customFunction']['props']
  ) {
    console.log('🚀 ~ inputs:', inputs);
    const args: Record<string, any> = {};

    props.forEach((prop) => {
      if (!prop.key) return;
      const rawData = getData(inputs?.find((item) => item.key === prop.key)?.value || null);
      console.log('🚀 ~ props.forEach ~ rawData:', rawData);

      args[prop.key] = convertValueByType(rawData, prop.type, prop.isList);
    });

    return args;
  }
  const customFunction = findCustomFunction(data.customFunctionId);
  console.log('🚀 ~ customFunction:', customFunction);

  if (_.isEmpty(customFunction)) return;
  const args = buildArgsFromDefinedProps(customFunction?.props, data?.props);
  console.log('🚀 ~ args:', args);
  const runFunction = () => {
    try {
      const fn = new Function(`return ${customFunction.code}`)() as (args: any) => any;

      if (typeof fn === 'function') {
        const result = fn(args);
        console.log('🚀 ~ runFunction ~ result:', result);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };
  return runFunction();
};
