'use client';

import { useEffect, useState } from 'react';

import GridSystemContainer from '@/components/grid-systems';
import { getDeviceType } from '@/lib/utils';
import { layoutStore } from '@/stores';

type DeviceType = 'mobile' | 'desktop';
export default function ClientWrapper(props: any) {
  // const { isLoading } = useConstructorDataAPI(props.documentId, props.pathName);
  const { data } = layoutStore();
  const layout = data;
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType());
  const selectedLayout = layout[deviceType] ?? layout ?? {};

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [props.page]);

  // if (isLoading) {
  //   return <LoadingPage />;
  // }

  return (
    <GridSystemContainer
      // isLoading={isLoading}
      {...props}
      page={selectedLayout || {}}
      deviceType={deviceType}
    />
  );
}
