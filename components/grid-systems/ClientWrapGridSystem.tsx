/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import _ from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useConstructorDataAPI, usePreviewUI } from '@/app/actions/use-constructor';
import GridSystemContainer from '@/components/grid-systems';
import { getDeviceType } from '@/lib/utils';
import { actionService } from '@/services';
import { apiCallService } from '@/services/apiCall';
import { stateManagerService } from '@/services/stateManagement';
import { apiResourceStore, layoutStore } from '@/stores';
import { actionsStore } from '@/stores/actions';
import { stateManagementStore } from '@/stores/stateManagement';
import { TTypeSelectState } from '@/types';

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
  //#region store
  const { setData } = layoutStore();
  const { addAndUpdateApiResource, apiResources } = apiResourceStore();
  const { setDataTypeDocumentVariable } = stateManagementStore();
  console.log('🚀 ~ PreviewUI ~ apiResources:', apiResources);
  const { setActions } = actionsStore();

  // #region hooks
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const { dataPreviewUI, isLoading } = usePreviewUI(projectId ?? '');

  // #region state
  const uid = searchParams.get('uid');
  const isPage = _.get(dataPreviewUI, 'data.typePreview') === 'page';
  const layout = _.get(dataPreviewUI, 'data.previewData');

  //#region function
  useEffect(() => {
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getStates = async () => {
    const list: TTypeSelectState[] = ['appState', 'componentState', 'globalState'];
    try {
      await Promise.all(
        list.map(async (type: TTypeSelectState) => {
          const result = await stateManagerService.getData(
            type === 'globalState'
              ? {
                  projectId: projectId ?? '',
                  type,
                }
              : {
                  uid: uid ?? '',
                  projectId: projectId ?? '',
                  type,
                }
          );
          if (_.isEmpty(result?.data)) return;
          const { state } = result?.data;
          if (_.isEmpty(state)) return;

          if (state) {
            setDataTypeDocumentVariable({
              type,
              dataUpdate: state,
            });
          }
        })
      );
    } catch (error) {
      console.log('🚀 ~ getStates ~ error:', error);
    }
  };

  const getActions = async () => {
    try {
      const result = await actionService.getData({
        projectId: projectId ?? '',
        uid: uid ?? '',
      });
      if (_.isEmpty(result?.data?.data)) return;
      setActions(result.data.data);
    } catch (error) {
      console.log('🚀 ~ getStates ~ error:', error);
    }
  };
  const getApiCall = async () => {
    try {
      const result = await apiCallService.get({ uid: uid ?? '', projectId: projectId ?? '' });
      addAndUpdateApiResource({ uid: uid ?? '', apis: result?.data?.apis });
      console.log('🚀 ~ getApiCall ~ result:', result);
    } catch (error) {
      console.log('🚀 ~ getApiCall ~ error:', error);
    }
  };

  useEffect(() => {
    if (layout) setData(layout);

    getStates();
    getApiCall();
    getActions();
  }, [uid, projectId]);

  //#region render
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
