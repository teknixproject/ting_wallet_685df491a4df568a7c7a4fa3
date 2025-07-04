/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { FC, memo, useMemo } from 'react';
import isEqual from 'react-fast-compare';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { stateManagementStore } from '@/stores';
import { GridItem } from '@/types/gridItem';
import { getComponentType } from '@/uitls/component';

import { componentRegistry, convertProps } from './ListComponent';
import LoadingPage from './loadingPage';

type TProps = {
  data: GridItem;
  valueStream?: any;
  formKeys?: { key: string; value: string }[];
};

// Custom hook to extract common logic
const useRenderItem = (data: GridItem, valueStream?: any) => {
  console.log('🚀 ~ useRenderItem ~ valueStream:', valueStream);
  const { findVariable } = stateManagementStore();
  const { getData, dataState } = useHandleData({ dataProp: data?.data });
  const { handleAction, isLoading } = useActions(data);

  const onPageLoad = useMemo(() => data?.actions?.onPageLoad, [data?.actions]);

  // const { data: dataQuery, isLoading } = useQuery({
  //   queryKey: [onPageLoad],
  //   queryFn: async () => {
  //     await handleAction('onPageLoad');
  //     return true;
  //   },
  //   enabled: !!onPageLoad,
  // });

  const valueType = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);

  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );

  const propsCpn = useMemo(() => {
    const result = convertProps({ data, getData, dataState, valueStream });
    return result;
  }, [data, dataState, valueStream, getData]);

  console.log('🚀 ~ propsCpn:', propsCpn);

  return {
    isLoading,
    valueType,
    Component,
    propsCpn,
    findVariable,
    dataState,
    getData,
  };
};

// Generic component renderer
const ComponentRenderer: FC<{
  Component: any;
  propsCpn: any;
  data: GridItem;
  children?: React.ReactNode;
}> = ({ Component, propsCpn, data, children }) => (
  <Component {...propsCpn}>{!_.isEmpty(data?.childs) ? children : propsCpn.children}</Component>
);

const RenderSliceItem: FC<TProps> = (props) => {
  const { data, valueStream } = props;
  const { isLoading, valueType, Component, propsCpn, dataState } = useRenderItem(data, valueStream);
  console.log(`🚀 ~ propsCpn: ${data?.id}`, propsCpn);
  const { isForm, isNoChildren, isChart } = getComponentType(data?.value || '');

  if (!valueType) return <div></div>;
  if (isLoading) return <LoadingPage />;
  if (isForm) return <RenderForm {...props} />;
  if (isNoChildren || isChart) return <Component {...propsCpn} />;

  return (
    <ComponentRenderer Component={Component} propsCpn={propsCpn} data={data}>
      {data?.childs?.map((child) => (
        <RenderSliceItem {...props} data={child} key={String(child.id)} />
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
  const formKeys = data?.componentProps?.formKeys;

  const onSubmit = (formData: any) => {
    console.log('🚀 ~ onSubmit ~ data:', formData);
    handleAction('onSubmit', data?.actions, formData);
  };
  console.log(`🚀 ~ propsCpn: ${data?.id}`, propsCpn);
  if (!valueType) return <div></div>;
  if (isLoading) return <LoadingPage />;

  return (
    <FormProvider {...methods}>
      <ComponentRenderer
        Component={Component}
        propsCpn={{ ...propsCpn, onFinish: () => handleSubmit(onSubmit)() }}
        data={data}
      >
        {data?.childs?.map((child) => (
          <RenderFormItem {...props} data={child} key={String(child.id)} formKeys={formKeys} />
        ))}
      </ComponentRenderer>
    </FormProvider>
  );
};

const RenderFormItem: FC<TProps> = (props) => {
  const { data, formKeys, valueStream } = props;

  const { findVariable } = stateManagementStore();
  const { getData, dataState } = useHandleData({ dataProp: data?.data });
  const { control } = useFormContext();
  const { isInput } = getComponentType(data?.value || '');

  const valueType = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);
  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );

  const propsCpn = useMemo(() => {
    const result = convertProps({ data, getData, dataState, valueStream });
    return result;
  }, [data, dataState, valueStream, getData]);
  console.log(`🚀 ~ propsCpn: ${data?.id}`, propsCpn);
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
        <RenderFormItem {...props} data={child} key={String(child.id)} />
      ))}
    </ComponentRenderer>
  );
};

export default memo(RenderSliceItem, isEqual);
