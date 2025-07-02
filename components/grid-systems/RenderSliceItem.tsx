/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { FC, memo, useMemo } from 'react';
import isEqual from 'react-fast-compare';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { stateManagementStore } from '@/stores';
import { GridItem } from '@/types/gridItem';
import { useQuery } from '@tanstack/react-query';

import ItemsRerender from './ItemsRerender';
import { componentRegistry, convertProps, getName } from './ListComponent';
import LoadingPage from './loadingPage';

type TProps = {
  data: GridItem;
  valueStream?: any;
};
const getComponentValues = (value: string) => {
  const valueType = value.toLowerCase();
  const isForm = ['form'].includes(valueType);
  const isNoChildren = ['list', 'collapse'].includes(valueType);
  const isChart = valueType.includes('chart');
  const isInput = ['inputtext', 'inputnumber', 'textarea', 'radio', 'select', 'checkbox'].includes(
    valueType
  );
  return {
    isForm,
    isNoChildren,
    isChart,
    isInput,
  };
};
const RenderSliceItem: FC<TProps> = ({ data, valueStream }) => {
  const { findVariable } = stateManagementStore();
  const { getData, dataState } = useHandleData({ dataProp: data?.data });
  console.log(`🚀 ~ dataState: ${data.id}`, dataState);
  const { handleAction } = useActions(data);
  // const { multiples } = useHandleProps({ actionsProp: data?.props });

  const { isForm, isNoChildren, isChart } = getComponentValues(data?.value || '');
  const onPageLoad = useMemo(() => data?.actions?.onPageLoad, [data?.actions]);
  const { data: dataQuery, isLoading } = useQuery({
    queryKey: [onPageLoad],
    queryFn: async () => {
      await handleAction('onPageLoad');
      return true;
    },
    enabled: !!onPageLoad,
  });

  const valueType: string = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);
  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );

  const props = useMemo(() => {
    const result = convertProps({ data, findVariable, dataState });
    if (valueStream) {
      const value = getData(data.data, valueStream);
      result.children = value || getName(data?.id);
    }
    return result;
  }, [data, findVariable, dataState, valueStream, getData]);

  console.log('🚀 ~ props:', props);

  if (!valueType) return <div></div>;

  if (isLoading) return <LoadingPage />;

  if (isForm) return <RenderForm data={data} valueStream={valueStream} />;

  if (isNoChildren || isChart) return <Component {...props} />;

  return (
    <Component {...props}>
      {!_.isEmpty(data?.childs)
        ? data?.childs?.map((child) => (
            <ItemsRerender data={child} key={String(child.id)} valueStream={valueStream} />
          ))
        : props.children}
    </Component>
  );
};
const RenderForm: FC<TProps> = ({ data, valueStream }) => {
  const { findVariable } = stateManagementStore();
  const { getData, dataState } = useHandleData({ dataProp: data?.data });
  console.log(`🚀 ~ dataState: ${data.id}`, dataState);
  const { handleAction } = useActions(data);
  // const { multiples } = useHandleProps({ actionsProp: data?.props });

  const methods = useForm();

  const formKeys = data?.componentProps?.formKeys;

  const onPageLoad = useMemo(() => data?.actions?.onPageLoad, [data?.actions]);
  const { data: dataQuery, isLoading } = useQuery({
    queryKey: [onPageLoad],
    queryFn: async () => {
      await handleAction('onPageLoad');
      return true;
    },
    enabled: !!onPageLoad,
  });

  const valueType: string = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);
  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );
  const props = useMemo(() => {
    const result = convertProps({ data, findVariable, dataState });
    if (valueStream) {
      const value = getData(data.data, valueStream);
      result.children = value || getName(data?.id);
    }
    return result;
  }, [data, findVariable, dataState, valueStream, getData]);

  console.log('🚀 ~ props:', props);

  if (!valueType) return <div></div>;

  if (isLoading) return <LoadingPage />;

  return (
    <FormProvider {...methods}>
      <Component {...props}>
        {!_.isEmpty(data?.childs)
          ? data?.childs?.map((child) => (
              <RenderFormItem
                data={child}
                key={String(child.id)}
                valueStream={valueStream}
                formKeys={formKeys}
              />
            ))
          : props.children}
      </Component>
    </FormProvider>
  );
};

const RenderFormItem: FC<{
  data: GridItem;
  valueStream: any;
  formKeys: Record<string, string>;
}> = ({ data, valueStream, formKeys }) => {
  const { findVariable } = stateManagementStore();
  const { getData, dataState } = useHandleData({ dataProp: data?.data });
  const valueType: string = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);
  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );
  const { control } = useFormContext();
  const { isInput } = getComponentValues(data?.value || '');
  const props = useMemo(() => {
    const result = convertProps({ data, findVariable, dataState });
    if (valueStream) {
      const value = getData(data.data, valueStream);
      result.children = value || getName(data?.id);
    }
    return result;
  }, [data, findVariable, dataState, valueStream, getData]);

  if (isInput) {
    const inFormKeys = Object.values(formKeys).includes(data?.name || '');

    if (inFormKeys) {
      return (
        <Controller
          control={control}
          name={valueStream}
          render={({ field }) => <Component {...field} {...props} />}
        />
      );
    }
    return <Component {...props} />;
  }
  return (
    <Component {...props}>
      {!_.isEmpty(data?.childs)
        ? data?.childs?.map((child) => (
            <ItemsRerender data={child} key={String(child.id)} valueStream={valueStream} />
          ))
        : props.children}
    </Component>
  );
};

export default memo(RenderSliceItem, isEqual);
