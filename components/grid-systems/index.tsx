/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { useActions } from '@/hooks/useActions';
import { useDynamicGenerate } from '@/hooks/useDynamicGenerate';
import { useHandleProps } from '@/hooks/useHandleProps';
import { componentRegistry } from '@/lib/slices';
import { cn, getDeviceSize, setActive } from '@/lib/utils';
import { GridItem } from '@/types/gridItem';
import { useQuery } from '@tanstack/react-query';

import LoadingPage from './loadingPage';
import { GridSystemProps, RenderGripProps } from './types';

const componentHasAction = ['pagination', 'button', 'input_text'];
const componentHasMenu = ['dropdown'];
const allowUpdateTitle = ['content'];
type TRenderSlice = { slice: GridItem | null | undefined; idParent: string; isMenu?: boolean };
//#region Render Slice
export const RenderSlice: React.FC<TRenderSlice> = ({ slice: sliceProp, isMenu }) => {
  const [slice, setSlice] = useState<GridItem>(sliceProp!);
  const pathname = usePathname();
  const { dynamicData, loading } = useDynamicGenerate({ data: sliceProp! });
  console.log('🚀 ~ dynamicData:', dynamicData);
  const { handleAction } = useActions(slice!);
  const { multiples } = useHandleProps({ actionsProp: slice?.props });
  const onPageLoad = useMemo(() => {
    return slice?.actions?.onPageLoad;
  }, [slice?.actions]);

  const { isLoading } = useQuery({
    queryKey: ['onPageLoad'],
    queryFn: async () => {
      await handleAction('onPageLoad');
      return true;
    },
    enabled: !!onPageLoad,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (!_.isEqual(dynamicData, slice)) {
      setSlice(dynamicData);
    }
  }, [dynamicData]);
  const key = _.upperFirst(slice?.id?.split('$')[0]);

  const isButton = key === 'button';

  const data = useMemo(() => {
    return componentHasAction.includes(key!) ? slice : _.get(slice, 'dataSlice');
  }, [slice]);

  const SliceComponent = useMemo(() => {
    return componentRegistry[key as keyof typeof componentRegistry];
  }, [key]);

  const styleDevice: string = getDeviceSize() as string;
  const styleSlice = (_.get(slice, [styleDevice]) as React.CSSProperties) || slice?.style;

  const inlineStyles = useMemo(() => {
    if (!slice) return {};
    const styleSlice = (_.get(slice, [styleDevice]) as React.CSSProperties) || slice.style;
    return {
      gridTemplateColumns: slice.type === 'grid' ? `repeat(${slice.columns}, 1fr)` : '',
      ...styleSlice,
    };
  }, [slice, styleDevice]);

  const isMenuConvert = isMenu || componentHasMenu.includes(key || '');
  const isActive = setActive({ isMenu: isMenuConvert, data, cleanedPath: pathname });
  if (isLoading) return <LoadingPage />;
  return (
    <SliceComponent
      id={_.get(slice, 'id')}
      style={styleSlice}
      data={slice}
      childs={slice?.childs}
      styleDevice={styleDevice}
      pathname={pathname}
      {...multiples}
    />
  );
};

//#region Render Grid
// eslint-disable-next-line react/display-name
export const RenderGrid: React.FC<RenderGripProps> = React.memo(({ idParent, slice }) => {
  const { dynamicData, loading } = useDynamicGenerate({ data: slice });

  const { handleAction } = useActions(slice);
  const onPageLoad = useMemo(() => slice?.actions?.onPageLoad, [slice?.actions]);

  // const { isLoading } = useQuery({
  //   queryKey: [onPageLoad],
  //   queryFn: () => handleAction('onPageLoad'),
  //   enabled: !!onPageLoad,
  // });

  // const childs = useMemo(() => dynamicData.childs || [], [dynamicData.childs]);

  return (
    <>
      {_.map(slice?.childs, (child) => (
        <RenderSlice slice={child} key={child.id} idParent={idParent} />
      ))}
    </>
  );
});

//#region Grid System
const GridSystemContainer: FC<GridSystemProps> = ({
  page,
  deviceType,
  isBody,
  isFooter,
  style,
}) => {
  const styleDevice: string = getDeviceSize() as string;

  const config = page;
  const { handleAction } = useActions(config);
  const onPageLoad = useMemo(() => config?.actions?.onPageLoad, [config?.actions]);

  const { isLoading } = useQuery({
    queryKey: [onPageLoad],
    queryFn: () => handleAction('onPageLoad'),
    enabled: !!onPageLoad,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadingPage />;
  return (
    <div className={cn('', isBody ? 'z-1 min-h-screen' : '', isFooter ? 'z-3' : '')} style={style}>
      {config?.childs?.map((item) => (
        <RenderSlice idParent={''} slice={item} key={item.id} />
      ))}
    </div>
  );
};

export default GridSystemContainer;
