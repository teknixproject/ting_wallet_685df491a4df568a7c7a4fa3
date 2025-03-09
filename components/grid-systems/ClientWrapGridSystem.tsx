'use client';

import _ from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useConstructorDataAPI, usePreviewUI } from '@/app/actions/use-constructor';
import GridSystemContainer from '@/components/grid-systems';
import { getDeviceType } from '@/lib/utils';

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
  const { layout, isLoading } = useConstructorDataAPI(props.documentId, props.pathName);
  // const { data } = layoutStore();
  // const layout = data;
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType());
  const selectedLayout = layout[deviceType] ?? layout ?? {};
  console.log('🚀 ~ RenderUIClient ~ layout:', layout);

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
      // isLoading={isLoading}
      {...props}
      page={selectedLayout || {}}
      deviceType={deviceType}
    />
  );
};

const PreviewUI = (props: any) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [deviceType, setDeviceType] = useState(getDeviceType());
  const { dataPreviewUI, isLoading } = usePreviewUI(projectId ?? '');
  const isComponent = _.get(dataPreviewUI, 'data.typePreview') === 'page';
  const layout = _.get(dataPreviewUI, 'data.previewData');

  useEffect(() => {
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="component-preview-container">
      {isComponent ? (
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
