'use client';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { rebuilComponentMonaco } from '@/app/actions/use-constructor';
import { CONFIGS } from '@/configs';
import { componentRegistry } from '@/lib/slices';
import { cn, getDeviceSize } from '@/lib/utils';
import { useApiCallStore } from '@/providers';
import { apiResourceStore } from '@/stores';
import { GridItem } from '@/types/gridItem';
import { dynamicGenarateUtil } from '@/uitls/dynamicGenarate';

import NotFound from './404';
import { GapGrid, GridRow, mapAlineItem, mapJustifyContent, SpanCol, SpanRow } from './const';
import LoadingPage from './loadingPage';
import { GridSystemProps, RenderGripProps } from './types';

const componentHasAction = ['pagination', 'button', 'input_text'];
const allowUpdateTitle = ['content'];
type TRenderSlice = { slice: GridItem | null | undefined; idParent: string };
const { updateTitleInText } = dynamicGenarateUtil;

export const RenderSlice: React.FC<TRenderSlice> = ({ slice }) => {
  const { apiData } = useApiCallStore((state) => state);
  const [sliceRef, setSliceRef] = useState<GridItem | null | undefined>(slice);

  useEffect(() => {
    if (
      sliceRef &&
      sliceRef?.dynamicGenerate?.dataJsonPath &&
      allowUpdateTitle.includes(sliceRef.type)
    ) {
      const { apiCall } = sliceRef.dynamicGenerate || {};
      const valueJson = apiData.find((item) => item.id === apiCall?.id);
      // Cập nhật tiêu đề cho content
      const title = updateTitleInText(sliceRef, valueJson?.data);
      // Cập nhật sliceRef với các card mới
      if (title !== sliceRef?.dataSlice?.title) {
        setSliceRef((prev) => ({
          ...prev,
          dataSlice: { title: _.isArray(title) ? title[0] : title },
          type: prev?.type || 'grid',
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiData, slice, updateTitleInText]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = useMemo(() => {
    const key = sliceRef?.id?.split('$')[0];
    return componentHasAction.includes(key!) ? sliceRef : _.get(sliceRef, 'dataSlice');
  }, [sliceRef]);

  const styleDevice: string = getDeviceSize() as string;

  // const key = sliceRef?.id?.split('$')[0];

  const SliceComponent = useMemo(() => {
    const key = sliceRef?.id?.split('$')[0];
    return componentRegistry[key as keyof typeof componentRegistry];
  }, [sliceRef?.id]);

  // const isButton = key === 'button';

  const styleSlice = (_.get(sliceRef, [styleDevice]) as React.CSSProperties) || sliceRef?.style;

  const sliceClasses = useMemo(() => {
    if (!sliceRef) return '';
    return [
      sliceRef.colspan ? SpanCol(Number(sliceRef.colspan)) : '',
      sliceRef.rowspan ? SpanRow(Number(sliceRef.rowspan)) : '',
      sliceRef.rows ? GridRow(Number(sliceRef.rows)) : '',
      sliceRef.gap ? GapGrid(Number(sliceRef.gap)) : '',
      sliceRef.type === 'grid' ? 'grid' : '',
      sliceRef.type === 'flex' && mapJustifyContent(sliceRef.justifyContent),
      sliceRef.type === 'flex' && mapAlineItem(sliceRef.alignItems),
      sliceRef.type === 'flex' && 'flex',
    ]
      .filter(Boolean)
      .join(' ');
  }, [sliceRef]);

  const inlineStyles = useMemo(() => {
    if (!sliceRef) return {};
    const styleSlice = (_.get(sliceRef, [styleDevice]) as React.CSSProperties) || sliceRef.style;
    return {
      ...styleSlice,
      gridTemplateColumns: sliceRef.type === 'grid' ? `repeat(${sliceRef.columns}, 1fr)` : '',
    };
  }, [sliceRef, styleDevice]);
  console.log('🚀 ~ inlineStyles ~ inlineStyles:', inlineStyles);

  const content = SliceComponent ? (
    <SliceComponent
      id={_.get(sliceRef, 'id')}
      style={styleSlice}
      data={sliceRef}
      childs={sliceRef?.childs}
    />
  ) : (
    sliceRef?.childs && (
      <RenderGrid items={sliceRef.childs} idParent={sliceRef.id!} slice={sliceRef} />
    )
  );

  return sliceClasses || Object.keys(inlineStyles).length ? (
    <div className={`${sliceClasses} ${_.get(styleSlice, 'className', '')} `} style={inlineStyles}>
      {content}
    </div>
  ) : null;
};

export const RenderGrid: React.FC<RenderGripProps> = ({ idParent, slice }) => {
  const { apiData, addApiData } = useApiCallStore((state) => state);
  const [childs, setChilds] = useState<GridItem[]>(slice?.childs || []);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const { createCardsFromApi, getDataFromApi } = dynamicGenarateUtil;
  const { findApiResourceValue } = apiResourceStore();

  const apiCallId = slice?.dynamicGenerate?.apiCall?.id;

  useEffect(() => {
    if (!apiCallId) return;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const { apiCall, dataJsonPath } = slice.dynamicGenerate ?? {};
        const apiResource = findApiResourceValue(uid ?? '', apiCall?.id ?? '');

        if (!apiResource) {
          setIsLoading(false);
          return;
        }

        const result = await getDataFromApi(apiData, idParent, apiResource);

        if (!_.isEmpty(result)) {
          addApiData({ id: apiCall?.id ?? '', data: result, idParent });
        }

        // Create new childs from API data
        const newCards = createCardsFromApi(slice, result, dataJsonPath ?? '');
        setChilds(newCards as GridItem[]);
      } catch (error) {
        console.error('Error fetching API data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCallId, uid, idParent, slice]);

  // Memoize the rendered children to avoid unnecessary re-renders
  const renderedChildren = useMemo(() => {
    return _.map(childs, (child, index) => (
      <RenderSlice slice={child} key={index} idParent={idParent} />
    ));
  }, [childs, idParent]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return <>{renderedChildren}</>;
};

const GridSystemContainer = ({ page, deviceType, isBody, isHeader, isFooter }: GridSystemProps) => {
  const [layout, setLayout] = useState<GridItem | null>(null);

  const config = layout || page;
  const [refreshKey, setRefreshKey] = useState(0);
  const previousComponentRef = useRef(null);

  const MonacoContainerRoot = useMemo(() => {
    return dynamic(() => import('@/components/grid-systems/monacoContainer'), {
      ssr: false,
      loading: () => <LoadingPage />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]); // ✅

  const content = (
    <div className="mx-auto flex justify-center">
      {config?.childs ? (
        <div className="w-full flex flex-col justify-center flex-wrap" id={config.id}>
          <RenderGrid items={config.childs} idParent={config.id!} slice={config} />
        </div>
      ) : (
        <NotFound />
      )}
    </div>
  );

  useEffect(() => {
    const socket = io(CONFIGS.SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });
    socket.on('connected', () => console.log('connected'));
    socket.on('return-json', async (data) => {
      if (data?.component && data.component !== previousComponentRef.current) {
        previousComponentRef.current = data.component;
        setRefreshKey((prev) => prev + 1);
        await rebuilComponentMonaco(data.component);
      }
      if (data?.layout) {
        setTimeout(() => setLayout(data.layout[deviceType]), 0);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [deviceType]);

  if (!MonacoContainerRoot || typeof MonacoContainerRoot !== 'function') {
    return <div>{content}</div>;
  }

  return (
    <div
      className={cn(
        '',
        isBody ? 'z-1 min-h-screen' : '',
        isHeader ? 'z-3 sticky top-0' : '',
        isFooter ? 'z-3' : ''
      )}
    >
      <MonacoContainerRoot key={refreshKey}>
        {content}

        {isBody && <div className="h-screen bg-amber-50"></div>}
      </MonacoContainerRoot>
    </div>
  );
};

export default GridSystemContainer;
