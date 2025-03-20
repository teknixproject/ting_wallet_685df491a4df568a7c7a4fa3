/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import _ from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useConstructorDataAPI, usePreviewUI } from '@/app/actions/use-constructor';
import GridSystemContainer from '@/components/grid-systems';
import { getDeviceType } from '@/lib/utils';
import { apiCallService } from '@/services/apiCall';
import { apiResourceStore, layoutStore } from '@/stores';

import LoadingPage from './loadingPage';
import SandPackUI from './preview-ui';

type DeviceType = 'mobile' | 'desktop';
export default function ClientWrapper(props: any) {
  // const { isLoading } = useConstructorDataAPI(props.documentId, props.pathName);

  const isPreviewUI = _.get(props, 'pathName') === 'preview-ui';

  if (isPreviewUI) {
    return <PreviewUI {...props} />;
  }
  return <RenderUIClient {...props} />;
}

const RenderUIClient = (props: any) => {
  console.log('🚀 ~ RenderUIClient ~ props:', props);
  const { layout, isLoading } = useConstructorDataAPI(props.documentId, props.pathName);
  console.log('🚀 ~ RenderUIClient ~ layout:', layout);
  const { setData } = layoutStore();

  useEffect(() => {
    if (layout) setData(layout);
  }, []);

  // const layout = data;
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

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <GridSystemContainer
      isLoading={isLoading}
      {...props}
      page={selectedLayout || {}}
      deviceType={deviceType}
    />
  );
};

const PreviewUI = (props: any) => {
  console.log('🚀 ~ PreviewUI ~ props:', props);
  const { setData } = layoutStore();
  const { addAndUpdateApiResource, apiResources } = apiResourceStore();
  console.log('🚀 ~ PreviewUI ~ apiResources:', apiResources);
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const uid = searchParams.get('uid');

  const [deviceType, setDeviceType] = useState(getDeviceType());
  const { dataPreviewUI, isLoading } = usePreviewUI(projectId ?? '');
  const isPage = _.get(dataPreviewUI, 'data.typePreview') === 'page';
  const layout = _.get(dataPreviewUI, 'data.previewData');

  useEffect(() => {
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (layout) setData(layout);
    const getApiCall = async () => {
      try {
        const result = await apiCallService.get({ uid: uid ?? '', projectId: projectId ?? '' });
        addAndUpdateApiResource({ uid: uid ?? '', apis: result?.data?.apis });
        console.log('🚀 ~ getApiCall ~ result:', result);
      } catch (error) {
        console.log('🚀 ~ getApiCall ~ error:', error);
      }
    };
    getApiCall();
  }, [uid, projectId]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="component-preview-container">
      {isPage ? (
        <GridSystemContainer
          isLoading={isLoading}
          {...props}
          page={layout[deviceType] || {}}
          deviceType={deviceType}
        />
      ) : (
        <SandPackUI dataPreviewUI={dataPreviewUI} />
      )}
    </div>
  );
};
