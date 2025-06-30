import _ from 'lodash';
import { FC, memo, useMemo } from 'react';
import isEqual from 'react-fast-compare';

import { stateManagementStore } from '@/stores';
import { GridItem } from '@/types/gridItem';

import ItemsRerender from './ItemsRerender';
import { componentRegistry, convertProps } from './ListComponent';

type TProps = {
  data: GridItem;
};
const RenderSliceItem: FC<TProps> = ({ data }) => {
  console.log('🚀 RenderSliceItem~ data:', data);
  const { findVariable } = stateManagementStore();
  const valueType: string = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);
  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );
  if (!valueType) return <div></div>;

  const props = convertProps({ data, findVariable });

  console.log('🚀 ~ props:', props);
  return (
    <Component {...props}>
      {!_.isEmpty(data?.childs)
        ? data?.childs?.map((child) => <ItemsRerender data={child} key={String(child.id)} />)
        : 'card'}
    </Component>
  );
};

export default memo(RenderSliceItem, isEqual);
