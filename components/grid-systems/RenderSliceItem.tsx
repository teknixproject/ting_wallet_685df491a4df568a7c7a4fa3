/* eslint-disable @typescript-eslint/no-unused-vars */
import dayjs from 'dayjs';
/** @jsxImportSource @emotion/react */
import _ from 'lodash';
import { FC, useMemo } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { useHandleProps } from '@/hooks/useHandleProps';
import { stateManagementStore } from '@/stores';
import { GridItem } from '@/types/gridItem';
import { getComponentType } from '@/uitls/component';
import { convertCssObjectToCamelCase, convertToEmotionStyle } from '@/uitls/styleInline';
import { convertDataToProps } from '@/uitls/transfromProp';
import { css } from '@emotion/react';

import { componentRegistry, convertProps } from './ListComponent';
import LoadingPage from './loadingPage';

type TProps = {
  data: GridItem;
  valueStream?: any;
  formKeys?: { key: string; value: string }[];
};
const getPropData = (data: GridItem) =>
  data?.componentProps?.dataProps?.filter((item: any) => item.type === 'data');

const getPropActions = (data: GridItem) =>
  data?.componentProps?.dataProps?.filter((item: any) => item.type.includes('MouseEventHandler'));

const handleCssWithEmotion = (staticProps: Record<string, any>) => {
  const advancedCss = convertToEmotionStyle(staticProps?.styleMultiple);
  let cssMultiple;

  if (typeof advancedCss === 'string') {
    // If it's a CSS string, use template literal directly
    cssMultiple = css`
      ${advancedCss}
    `;
  } else if (advancedCss && typeof advancedCss === 'object') {
    // If it's a CSS object, convert kebab-case to camelCase and use as object
    const convertedCssObj = convertCssObjectToCamelCase(advancedCss);
    cssMultiple = css(convertedCssObj);
  } else {
    // Fallback to empty css
    cssMultiple = css``;
  }

  return cssMultiple;
};
// Custom hook to extract common logic
const useRenderItem = (data: GridItem, valueStream?: any) => {
  // console.log('🚀 ~ useRenderItem ~ valueStream:', valueStream);
  const { isForm, isNoChildren, isChart, isDatePicker } = getComponentType(data?.value || '');
  const { findVariable } = stateManagementStore();
  const { dataState } = useHandleData({
    dataProp: getPropData(data),
    valueStream,
  });

  // console.log(`🚀 ~ useRenderItem ~ dataState:${data.id}`, dataState);
  const { actions } = useHandleProps({ dataProps: getPropActions(data) });

  const { handleAction, isLoading } = useActions(data);

  const valueType = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);

  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );

  const propsCpn = useMemo(() => {
    const staticProps = {
      ...convertProps({ data }),
    };

    staticProps.css = handleCssWithEmotion(staticProps);

    const result =
      valueType === 'menu'
        ? { ...staticProps, ...actions }
        : {
          ...staticProps,
          ...dataState,
          ...actions,
        };
    console.log('isDatePicker', isDatePicker);

    if (isDatePicker) {

      if (typeof result.value === 'string') result.value = dayjs(result.value);
      if (typeof result.defaultValue === 'string') result.defaultValue = dayjs(result.defaultValue);
    }
    if (isNoChildren && 'children' in result) {
      _.unset(result, 'children');
    }
    if ('styleMultiple' in result) _.unset(result, 'styleMultiple');
    if ('dataProps' in result) _.unset(result, 'dataProps');

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dataState, valueStream, handleAction]);

  return {
    isLoading,
    valueType,
    Component,
    propsCpn: convertDataToProps(propsCpn),
    findVariable,
    dataState,
  };
};

// Generic component renderer
const ComponentRenderer: FC<{
  Component: any;
  propsCpn: any;
  data: GridItem;
  children?: React.ReactNode;
}> = ({ Component, propsCpn, data, children }) => (
  <Component key={data?.id} {...propsCpn}>
    {!_.isEmpty(data?.childs) ? children : propsCpn.children}
  </Component>
);

const RenderSliceItem: FC<TProps> = (props) => {
  const { data, valueStream } = props;
  const { isLoading, valueType, Component, propsCpn, dataState } = useRenderItem(data, valueStream);
  // console.log(`🚀 ~ propsCpn: ${data.id}`, {
  //   propsCpn,
  //   data,
  // });
  const { isForm, isNoChildren, isChart, isFeebBack } = getComponentType(data?.value || '');
  if (!valueType) return <div></div>;
  if (isLoading) return <LoadingPage />;
  if (isForm) return <RenderForm {...props} />;

  if (isNoChildren || isChart) return <Component key={data?.id} {...propsCpn} />;

  return (
    <ComponentRenderer Component={Component} propsCpn={propsCpn} data={data}>
      {data?.childs?.map((child, index) => (
        <RenderSliceItem
          {...props}
          data={child}
          key={child.id ? String(child.id) : `child-${index}`}
        />
      ))}
    </ComponentRenderer>
  );
};

const RenderForm: FC<TProps> = (props) => {
  const { data, valueStream } = props;
  const { isLoading, valueType, Component, propsCpn, dataState } = useRenderItem(data, valueStream);

  const methods = useForm({
    values: dataState,
  });
  const { handleSubmit } = methods;
  const { handleAction } = useActions();
  const formKeys = useMemo(() => data?.componentProps?.formKeys, [data?.componentProps?.formKeys]);

  const onSubmit = (formData: any) => {
    handleAction('onSubmit', data?.actions, formData);
  };
  if (!valueType) return <div></div>;
  if (isLoading) return <LoadingPage />;

  return (
    <FormProvider {...methods}>
      <ComponentRenderer
        Component={Component}
        propsCpn={{
          ...propsCpn,
          onFinish: () => handleSubmit(onSubmit)(),
        }}
        data={data}
      >
        {data?.childs?.map((child, index) => (
          <RenderFormItem
            {...props}
            data={child}
            key={`form-child-${child.id}`}
            formKeys={formKeys}
          />
        ))}
      </ComponentRenderer>
    </FormProvider>
  );
};

const RenderFormItem: FC<TProps> = (props) => {
  const { data, formKeys, valueStream } = props;
  const { isLoading, valueType, Component, propsCpn, dataState } = useRenderItem(data, valueStream);
  const { findVariable } = stateManagementStore();
  // const { getData, dataState } = useHandleData({ dataProp: data?.data });
  const { control } = useFormContext();
  const { isInput } = getComponentType(data?.value || '');

  if (!valueType) return <div></div>;

  if (isInput) {
    const inFormKeys = formKeys?.find((item) => item?.value === data?.name);

    if (inFormKeys) {
      return (
        <Controller
          control={control}
          name={inFormKeys.key}
          render={({ field }) => <Component {...propsCpn} {...field} />}
        />
      );
    }
    return <Component {...propsCpn} />;
  }

  return (
    <ComponentRenderer Component={Component} propsCpn={propsCpn} data={data}>
      {data?.childs?.map((child) => (
        <RenderFormItem {...props} data={child} key={`form-child-${child.id}`} />
      ))}
      <p className="grow"></p>
    </ComponentRenderer>
  );
};

export default RenderSliceItem;
