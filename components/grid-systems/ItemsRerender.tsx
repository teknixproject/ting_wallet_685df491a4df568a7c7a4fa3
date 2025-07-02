import { FC, memo } from 'react';
import isEqual from 'react-fast-compare';

import { GridItem } from '@/types/gridItem';

import RenderSliceItem from './RenderSliceItem';

type TProps = { data: GridItem; valueStream: any };
const ItemsRerender: FC<TProps> = ({ data, valueStream }) => {
  if (!data) return <></>;

  return <RenderSliceItem data={data} key={data?.id} valueStream={valueStream} />;
};
ItemsRerender.displayName = 'ItemsRerender';
export default memo(ItemsRerender, isEqual);
