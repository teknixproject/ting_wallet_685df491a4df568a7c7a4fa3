/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { CSSProperties, useEffect, useState } from 'react';

import { stateManagementStore } from '@/stores/stateManagement';
import { TTypeSelectState } from '@/types';
import { variableUtil } from '@/uitls';

import { GridItem } from '../grid-systems/const';

interface TextProps {
  data: GridItem;
  style?: CSSProperties;
}

const Text = ({ data, style }: TextProps) => {
  const [title, setTitle] = useState<string>(_.get(data, 'dataSlice.title', 'Text'));
  const [variableName, setVariableName] = useState<string>(
    _.get(data, 'dataSlice.variableName', '')
  );
  const [typeStore, setTypeStore] = useState<TTypeSelectState>(
    _.get(data, 'dataSlice.typeStore', 'appState')
  );

  const { findVariable, appState } = stateManagementStore();
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
  }, [variableName, typeStore, appState]);
  const newStyle: CSSProperties = {
    ...style,
  };

  return (
    <div style={newStyle} className="text-[#858585]">
      {JSON.stringify(title)}
    </div>
  );
};

export default Text;
