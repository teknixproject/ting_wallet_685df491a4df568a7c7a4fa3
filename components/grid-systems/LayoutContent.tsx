// components/LayoutContent.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
// import { useConstructorDataAPI } from '@/app/actions/use-constructor';
import { getDeviceType } from '@/lib/utils';
import { useLayoutContext } from '@/context/LayoutContext';
import LoadingPage from './loadingPage';
import useSWR from 'swr';

const GridSystemContainer = dynamic(() => import('@/components/grid-systems'), {
  loading: () => <LoadingPage />,
  ssr: false,
});

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  return res.json();
};

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { headerLayout, footerLayout, setHeaderLayout, setFooterLayout } = useLayoutContext();
  const pathname = usePathname();

  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [stateLayoutIds, setStateLayoutIds] = useState({
    headerId: '',
    footerId: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

  const { data, error, isLoading } = useSWR(
    `${API_URL}/api/client/getLayout?pId=${projectId}&uid=${pathname}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  );

  // const {
  //   headerLayout: newHeaderLayout,
  //   footerLayout: newFooterLayout,
  //   isLoading,
  // } = useConstructorDataAPI(
  //   undefined, // Không cần documentId vì chỉ lấy header/footer
  //   pathname
  // );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (data && !error) {
      const newHeaderId = _.get(data, 'data.headerLayout._id');
      const newFooterId = _.get(data, 'data.footerLayout._id');
      const newHeaderLayout = _.get(data, 'data.headerLayout.layoutJson');
      const newFooterLayout = _.get(data, 'data.footerLayout.layoutJson');

      // Compare layouts by deep equality or use another unique property if _id does not exist
      if (newHeaderLayout && !_.isEqual(newHeaderId?._id, stateLayoutIds.headerId)) {
        console.log('newHeaderLayout', newHeaderLayout);
        setHeaderLayout(newHeaderLayout);
      }
      if (newFooterLayout && !_.isEqual(newFooterId?._id, stateLayoutIds.footerId)) {
        setFooterLayout(newFooterLayout);
      }
    }
  }, [
    data,
    error,
    headerLayout,
    footerLayout,
    setHeaderLayout,
    setFooterLayout,
    stateLayoutIds.headerId,
    stateLayoutIds.footerId,
  ]);

  const selectedHeaderLayout = useMemo(
    () => (headerLayout && (headerLayout as any)[deviceType]) ?? headerLayout ?? {},
    [headerLayout, deviceType]
  );
  const selectedFooterLayout = useMemo(
    () => (footerLayout && (footerLayout as Record<string, any>)[deviceType]) ?? footerLayout ?? {},
    [footerLayout, deviceType]
  );

  if (isLoading) return <LoadingPage />;

  return (
    <div className="relative flex flex-col min-h-screen">
      {!_.isEmpty(selectedHeaderLayout) && (
        <GridSystemContainer
          // isLoading={isLoading}
          page={selectedHeaderLayout}
          deviceType={deviceType}
          isHeader
        />
      )}
      <main>{children}</main>
      {!_.isEmpty(selectedFooterLayout) && (
        <GridSystemContainer
          // isLoading={isLoading}
          page={selectedFooterLayout}
          deviceType={deviceType}
          isFooter
        />
      )}
    </div>
  );
}
