/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { FC, memo, useMemo } from 'react';
import isEqual from 'react-fast-compare';

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
const RenderSliceItem: FC<TProps> = ({ data, valueStream }) => {
  const { findVariable } = stateManagementStore();
  const { getData, dataState } = useHandleData({ dataProp: data?.data });
  console.log(`🚀 ~ dataState: ${data.id}`, dataState);
  const { handleAction } = useActions(data);
  // const { multiples } = useHandleProps({ actionsProp: data?.props });

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
  if (!valueType) return <div></div>;

  const props = convertProps({ data, findVariable, dataState });
  if (valueStream) {
    const value = getData(data.data, valueStream);
    props.children = value || getName(data?.id);
  }

  console.log('🚀 ~ props:', props);
  if (isLoading) return <LoadingPage />;
  if (['list', 'collapse'].includes(valueType) || valueType.includes('chart'))
    return <Component {...props} />;
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
