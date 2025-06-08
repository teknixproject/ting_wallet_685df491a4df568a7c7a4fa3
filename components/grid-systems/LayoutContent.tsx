/* eslint-disable @typescript-eslint/no-unused-vars */
// components/LayoutContent.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import _ from 'lodash';
import { usePathname, useSearchParams } from 'next/navigation';
// import { useConstructorDataAPI } from '@/app/actions/use-constructor';
import { getDeviceType } from '@/lib/utils';
import { useLayoutContext } from '@/context/LayoutContext';
import LoadingPage from './loadingPage';
import useSWR from 'swr';
import { actionService, apiCallService, stateManagerService } from '@/services';
import { TTypeSelectState, TVariable, TVariableMap } from '@/types';
import { actionsStore, apiResourceStore, stateManagementStore } from '@/stores';

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
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Store hooks
  const { addAndUpdateApiResource } = apiResourceStore();
  const { setStateManagement } = stateManagementStore();
  const { setActions } = actionsStore();

  const [stateLayoutIds, setStateLayoutIds] = useState({
    headerId: '',
    footerId: '',
  });

  const { data, error, isLoading } = useSWR(
    `${API_URL}/api/client/getLayout?pId=${projectId}&uid=${pathname}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  );

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

  const uid: any =
    searchParams.get('uid') ||
    (pathname === '/' ? process.env.NEXT_PUBLIC_DEFAULT_UID : pathname.slice(1));

  const getActions = async () => {
    try {
      const result = await actionService.getData({ uid, projectId: projectId || '' });
      if (!_.isEmpty(result?.data?.data)) setActions(result.data.data);
    } catch (error) {
      console.log('🚀 ~ getActions ~ error:', error);
    }
  };

  const getStates = async () => {
    const list: TTypeSelectState[] = [
      'appState',
      'componentState',
      'globalState',
      'apiResponse',
      'dynamicGenerate',
    ];
    try {
      await Promise.all(
        list.map(async (type) => {
          const result = await stateManagerService.getData(
            type === 'globalState'
              ? { projectId: projectId || '', type }
              : { uid: uid || 'home', projectId: projectId || '', type }
          );
          if (_.isEmpty(result?.data)) return;
          const { state } = result?.data;
          if (_.isEmpty(state)) return;
          setStateManagement({
            type,
            dataUpdate: state.reduce(
              (acc: TVariableMap, item: TVariable) => ({
                ...acc,
                [item.id]: item,
              }),
              {}
            ),
          });
        })
      );
    } catch (error) {
      console.log('🚀 ~ getStates ~ error:', error);
    }
  };

  const getApiCall = async () => {
    try {
      const result = await apiCallService.get({ uid, projectId: projectId || '' });
      addAndUpdateApiResource({ apis: result?.data?.apis });
    } catch (error) {
      console.log('🚀 ~ getApiCall ~ error:', error);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    getStates();
    getApiCall();
    getActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, projectId]);

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
