'use client';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { getDeviceType } from '@/lib/utils';
import { useLayoutContext } from '@/context/LayoutContext';
import { actionService, apiCallService, stateManagerService } from '@/services';
import { TTypeSelectState, TVariable, TVariableMap } from '@/types';
import { actionsStore, apiResourceStore, stateManagementStore } from '@/stores';

import LoadingPage from './loadingPage';

const GridSystemContainer = dynamic(() => import('@/components/grid-systems'), {
  loading: () => <LoadingPage />,
  ssr: false,
});

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { headerLayout, footerLayout } = useLayoutContext();
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  // Store hooks
  const { addAndUpdateApiResource } = apiResourceStore();
  const { setStateManagement } = stateManagementStore();
  const { setActions } = actionsStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedHeaderLayout = useMemo(
    () =>
      (headerLayout?.layoutJson && (headerLayout?.layoutJson as any)[deviceType]) ??
      headerLayout?.layoutJson ??
      {},
    [headerLayout, deviceType]
  );
  const selectedFooterLayout = useMemo(
    () =>
      (footerLayout?.layoutJson && (footerLayout?.layoutJson as Record<string, any>)[deviceType]) ??
      footerLayout?.layoutJson ??
      {},
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

  // Lấy vị trí của header từ dữ liệu layout
  const headerPosition = headerLayout?.position ?? 'top';

  useEffect(() => {
    if (!projectId) return;
    getStates();
    getApiCall();
    getActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, projectId]);

  const containerStyle = useMemo(() => {
    if (headerPosition === 'left' || headerPosition === 'right') {
      return {
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
      };
    }
    return {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    };
  }, [headerPosition]);

  // Style cho header dựa trên vị trí
  const headerStyle = useMemo(() => {
    if (headerPosition === 'left') {
      return {
        width: '250px', // Độ rộng cố định cho sidebar
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      };
    } else if (headerPosition === 'right') {
      return {
        width: '250px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        order: 2, // Đặt header sang bên phải
      };
    }
    return {
      width: '100%',
      position: 'fixed',
      top: 0,
      zIndex: 3,
    };
  }, [headerPosition]);

  return (
    <div>
      <div style={containerStyle as any}>
        {!_.isEmpty(selectedHeaderLayout) && (
          <GridSystemContainer
            page={selectedHeaderLayout}
            deviceType={deviceType}
            isHeader
            style={headerStyle}
          />
        )}
        <main style={{ flex: 1 }}>{children}</main>
      </div>
      {!_.isEmpty(selectedFooterLayout) && (
        <GridSystemContainer
          page={selectedFooterLayout}
          deviceType={deviceType}
          isFooter
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
}
