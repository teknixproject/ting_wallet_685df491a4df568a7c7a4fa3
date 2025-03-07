'use client';
import axios from 'axios';
import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { rebuilComponentMonaco } from '@/app/actions/use-constructor';
import { CONFIGS } from '@/configs';
import { componentRegistry } from '@/lib/slices';
import { getDeviceSize } from '@/lib/utils';
import { apiCallStore } from '@/stores';

import NotFound from './404';
import {
  GapGrid,
  GridItem,
  GridRow,
  mapAlineItem,
  mapJustifyContent,
  SpanCol,
  SpanRow,
  ValueRender,
} from './const';
import LoadingPage from './loadingPage';
import { GridSystemProps, RenderGripProps } from './types';

type TRenderSlice = { slice: GridItem | null | undefined };
const RenderSlice: React.FC<TRenderSlice> = ({ slice }) => {
  const { apiData, addApiData } = apiCallStore();
  // const [exist, setExist] = useState<boolean>(false);
  const [sliceRef, setSliceRef] = useState<GridItem | null | undefined>(slice);
  // fetchData from 'valueRender'

  useEffect(() => {
    if (!slice) return;

    const fetchData = async () => {
      const getDataFromApi = async (apiCall: Pick<ValueRender, 'apiCall'>['apiCall']) => {
        const existingApiData = apiData.find((item) => item.id === apiCall.id);
        const result = _.isEmpty(existingApiData)
          ? await axios
              .request({
                url: apiCall.url,
                method: apiCall.method.toLowerCase(),
              })
              .then((response) => response.data)
          : existingApiData.data;
        return result;
      };

      const createChildsFromApi = async (sliceRef: GridItem, apiData: any) => {
        if (sliceRef.type === 'flex' || sliceRef.type === 'grid') {
          if (_.isEmpty(sliceRef.childs)) return;
          const childs = sliceRef.childs?.filter((value: GridItem) => value.value === 'text');

          const newChilds = childs
            ? Array.from({ length: apiData.length }).flatMap((_, index) =>
                childs.map((value: GridItem) => ({
                  ...value,
                  valueRender: {
                    ...(value.valueRender ?? {}),
                    jsonPath: value.valueRender?.jsonPath.replace(/\[\d*\]/, `[${index}]`),
                  },
                }))
              )
            : [];
          console.log('🚀 ~ fetchData ~ newChilds:', newChilds);
          setSliceRef((pre) => ({
            ...pre,
            childs: newChilds as GridItem[],
            type: pre?.type || 'grid',
          }));
          // updateData(sliceRef.id!, { childs: newChilds });
          return;
        }
      };

      const updateTitleInText = (sliceRef: GridItem, result: any) => {
        if (!sliceRef?.valueRender) return;
        const { jsonPath } = sliceRef.valueRender;
        if (!sliceRef?.value && !['text', 'button'].includes(sliceRef.value ?? '')) return;
        const titile = JSONPath({ path: jsonPath, json: result });
        setSliceRef((pre) => ({
          ...pre,
          dataSlice: { title: titile[0] },
          type: pre?.type || 'grid',
        }));
      };

      if (sliceRef && 'valueRender' in sliceRef) {
        if (!sliceRef.valueRender) return;
        const { apiCall } = sliceRef.valueRender;
        try {
          // get data from api or store
          const result = await getDataFromApi(apiCall);

          //if parent have childs and api, create new childs from api
          createChildsFromApi(sliceRef, result);

          //if slice is text or button, update title
          updateTitleInText(sliceRef, result);
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      }
      return null;
    };
    fetchData();
  }, [addApiData]);

  if (!sliceRef) return null;
  const styleDevice: string = getDeviceSize() as string;

  const key = sliceRef?.id?.split('$')[0];
  const SliceComponent = componentRegistry[key as keyof typeof componentRegistry];

  if (!SliceComponent && !sliceRef?.childs) return null;

  const isGrid = sliceRef?.type === 'grid' ? 'grid' : '';
  const isFlexBox = sliceRef?.type === 'flex';
  const isButton = key === 'button';

  const styleSlice = (_.get(sliceRef, [styleDevice]) as React.CSSProperties) || sliceRef?.style;

  const sliceClasses = [
    sliceRef?.colspan ? SpanCol(Number(sliceRef.colspan)) : '',
    sliceRef?.rowspan ? SpanRow(Number(sliceRef.rowspan)) : '',
    sliceRef?.rows ? GridRow(Number(sliceRef.rows)) : '',
    sliceRef?.gap ? GapGrid(Number(sliceRef.gap)) : '',
    isGrid,
    isFlexBox && mapJustifyContent(sliceRef?.justifyContent),
    isFlexBox && mapAlineItem(sliceRef?.alignItems),
    isFlexBox && 'flex',
  ]
    .filter(Boolean)
    .join(' ');

  const inlineStyles: React.CSSProperties = {
    ...(styleSlice || {}),
    gridTemplateColumns: isGrid ? `repeat(${sliceRef?.columns}, 1fr)` : '',
  };

  const content = SliceComponent ? (
    <SliceComponent style={styleSlice} data={_.get(sliceRef, 'dataSlice')} />
  ) : (
    sliceRef?.childs && <RenderGrid items={sliceRef.childs} />
  );

  return sliceClasses || Object.keys(inlineStyles).length ? (
    <div className={`${sliceClasses}`} style={isButton ? {} : inlineStyles}>
      {content}
    </div>
  ) : null;
};

const RenderGrid = ({ items }: RenderGripProps) => {
  return (
    <>
      {_.map(items, (slice, index) => (
        <RenderSlice slice={slice} key={index} />
      ))}
    </>
  );
};

const GridSystemContainer = ({ page, deviceType }: GridSystemProps) => {
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
        <div className="w-full flex flex-col justify-center flex-wrap overflow-auto">
          <RenderGrid items={config.childs} />
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
    return <>{content}</>;
  }

  return (
    <div className="overflow-hidden">
      <MonacoContainerRoot key={refreshKey}>{content}</MonacoContainerRoot>
    </div>
  );
};

export default GridSystemContainer;
