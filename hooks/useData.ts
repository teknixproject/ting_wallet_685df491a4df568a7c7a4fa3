/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { GridItem } from '@/components/grid-systems/const';
import { stateManagementStore } from '@/stores';
import { TTypeSelectState } from '@/types';
import { variableUtil } from '@/uitls';

export const useData = (layoutData: GridItem) => {
  const [title, setTitle] = useState<string>(_.get(layoutData, 'dataSlice.title', 'Text'));
  const [variableName, setVariableName] = useState<string>(
    _.get(layoutData, 'dataSlice.variableName', '')
  );
  const [typeStore, setTypeStore] = useState<TTypeSelectState>(
    _.get(layoutData, 'dataSlice.typeStore', 'appState')
  );

  const { findVariable, appState, componentState, globalState } = stateManagementStore();
  console.log('🚀 ~ Text ~ appState:', appState);

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
