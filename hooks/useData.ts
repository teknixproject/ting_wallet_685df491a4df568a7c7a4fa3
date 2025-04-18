/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { stateManagementStore } from '@/stores';
import { TTypeSelectState } from '@/types';
import { GridItem } from '@/types/gridItem';
import { variableUtil } from '@/uitls';

type Props = {
  layoutData: GridItem;
  defaultTitle?: string;
};
export const useData = ({ layoutData, defaultTitle = 'Text' }: Props) => {
  const [title, setTitle] = useState<string>(layoutData?.dataSlice?.title || defaultTitle);
  const [variableName, setVariableName] = useState<string>(
    _.get(layoutData, 'dataSlice.variableName', '')
  );
  const [typeStore, setTypeStore] = useState<TTypeSelectState>(
    _.get(layoutData, 'dataSlice.typeStore', 'appState')
  );

  const { findVariable, appState, componentState, globalState } = stateManagementStore();

  const { extractAllValuesFromTemplate } = variableUtil;

  useEffect(() => {
    if (variableName && typeStore) {
      const key = extractAllValuesFromTemplate(variableName);
      const valueInStore = findVariable({
        type: typeStore,
        name: key ?? '',
      });
      console.log('🚀 ~ useEffect ~ valueInStore:', valueInStore);
      setTitle(valueInStore?.value ?? 'Text');
    }
  }, [variableName, typeStore, appState, componentState, globalState]);

  return {
    title,
  };
};
