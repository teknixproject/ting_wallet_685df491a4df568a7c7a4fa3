import { JSONPath } from 'jsonpath-plus';
/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { stateManagementStore } from '@/stores';
import { TTypeSelectState } from '@/types';
import { GridItem } from '@/types/gridItem';
import { variableUtil } from '@/uitls';

type Props = {
  layoutData: GridItem;
  defaultTitle?: string | Record<string, any>;
};

export const useData = ({ layoutData, defaultTitle = 'Text' }: Props) => {
  const [title, setTitle] = useState<string | Record<string, any>>(
    _.get(layoutData, 'dataSlice.title', defaultTitle)
  );
  const [variableName, setVariableName] = useState<string>(
    _.get(layoutData, 'dataSlice.variableName', '')
  );
  const [typeStore, setTypeStore] = useState<TTypeSelectState>(
    _.get(layoutData, 'dataSlice.typeStore', 'appState')
  );

  const { findVariable, appState, componentState, globalState } = stateManagementStore();

  // useEffect(() => {
  //   const newTitle = _.get(layoutData, 'dataSlice.title', defaultTitle);
  //   setTitle(newTitle);
  //   setVariableName(_.get(layoutData, 'dataSlice.variableName', ''));
  //   setTypeStore(_.get(layoutData, 'dataSlice.typeStore', 'appState'));
  // }, [layoutData, defaultTitle]);

  const { extractAllValuesFromTemplate } = variableUtil;

  useEffect(() => {
    if (variableName && typeStore) {
      const key = extractAllValuesFromTemplate(variableName);
      if (key) {
        const valueInStore = findVariable({
          type: typeStore,
          name: key,
        });
        if (valueInStore !== undefined) {
          const jsonPath = _.get(layoutData, 'dataSlice.jsonPath', '');
          if (jsonPath) {
            const valueJsonPath = JSONPath({ path: jsonPath!, json: valueInStore.value });
            setTitle(_.isArray(valueJsonPath) ? valueJsonPath[0] : valueJsonPath ?? defaultTitle);
          } else setTitle(valueInStore.value ?? defaultTitle);
        }
      }
    }
  }, [
    variableName,
    typeStore,
    appState,
    componentState,
    globalState,
    findVariable,
    extractAllValuesFromTemplate,
    defaultTitle,
  ]);

  return {
    title,
  };
};
