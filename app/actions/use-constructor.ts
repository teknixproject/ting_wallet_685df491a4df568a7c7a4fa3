/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useLayoutContext } from '@/context/LayoutContext';
import _ from 'lodash';
import { useEffect } from 'react';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  return res.json();
};

export function useConstructorDataAPI(_documentId?: string, pageName?: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  const { headerLayout, footerLayout, setHeaderLayout, setFooterLayout } = useLayoutContext();

  const { data, error, isLoading } = useSWR(
    pageName ? `${API_URL}/api/client/getLayout?pId=${projectId}&uid=${pageName}` : null,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  );

  const newHeaderLayout = _.get(data, 'data.headerLayout.layoutJson', null);
  const newHeaderId = _.get(data, 'data.headerLayout._id', '');
  const newFooterLayout = _.get(data, 'data.footerLayout.layoutJson', null);
  const newFooterId = _.get(data, 'data.footerLayout._id', '');

  useEffect(() => {
    if (data && !error) {
      // Chỉ set khi _id khác và layout hợp lệ
      if (newHeaderId && newHeaderId !== (headerLayout?._id || '')) {
        setHeaderLayout({ _id: newHeaderId, layoutJson: newHeaderLayout });
      }
      if (newFooterId && newFooterId !== (footerLayout?._id || '')) {
        setFooterLayout({ layoutJson: newFooterLayout, _id: newFooterId });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newHeaderId, newFooterId]);

  if (error) {
    console.error('❌ Error fetching constructor:', error);
    return {
      headerLayout: {},
      bodyLayout: {},
      footerLayout: {},
      isLoading: false,
      error: true,
    };
  }

  if (!data) {
    return {
      headerLayout: {},
      bodyLayout: {},
      footerLayout: {},
      isLoading: true,
      error: false,
    };
  }

  return {
    headerLayout: _.get(data, 'data.headerLayout.layoutJson', {}),
    bodyLayout: _.get(data, 'data.bodyLayout.layoutJson', {}),
    footerLayout: _.get(data, 'data.footerLayout.layoutJson', {}),
    isLoading: false,
    error: false,
  };
}

export async function rebuilComponentMonaco(componentString: string) {
  try {
    if (!componentString || typeof componentString !== 'string') {
      console.error('Error: Invalid componentString', componentString);
      return;
    }
  } catch (error) {
    console.error('Build failed:', error);
  }
}

export function usePreviewUI(
  projectId?: string,
  uid?: string | null,
  sectionName?: string | null,
  userId?: string | null
) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const newUID = uid === 'null' ? uid : uid;
  const newSectionName = sectionName === 'null' ? sectionName : sectionName;

  const { data: dataPreviewUI } = useSWR(
    projectId
      ? `${API_URL}/api/preview-ui?projectId=${projectId}&uid=${newUID}&sectionName=${newSectionName}&userId=${userId}`
      : null,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  );

  if (!dataPreviewUI) return { data: {}, isLoading: true };

  return {
    dataPreviewUI: dataPreviewUI?.data,
    isLoading: false,
  };
}
