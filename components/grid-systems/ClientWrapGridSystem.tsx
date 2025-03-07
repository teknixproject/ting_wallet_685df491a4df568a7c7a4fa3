'use client';

import LoadingPage from './loadingPage';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import GridSystemContainer from '@/components/grid-systems';
import SandPackUI from './preview-ui';
import { getDeviceType } from '@/lib/utils';
import { useConstructorDataAPI, usePreviewUI } from '@/app/actions/use-constructor';

export default function ClientWrapper(props: any) {
  const isPreviewUI = _.get(props, 'pathName') === 'preview-ui';

  if (isPreviewUI) {
    return <PreviewUI {...props} />;
  }
  return <RenderUIClient {...props} />;
}

const RenderUIClient = (props: any) => {
  const { layout, isLoading } = useConstructorDataAPI(props.documentId, props.pathName);

  const [deviceType, setDeviceType] = useState(getDeviceType());
  const selectedLayout = layout[deviceType] ?? layout ?? {};

  useEffect(() => {
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
