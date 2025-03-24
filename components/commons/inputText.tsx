import _ from 'lodash';
import React, { ChangeEvent } from 'react';
import { CSSProperties } from 'styled-components';

import { stateManagementStore } from '@/stores/stateManagement';

import { GridItem } from '../grid-systems/const';

type Props = { data: GridItem };

const InputText: React.FC<Props> = ({ data }) => {
  const title = _.get(data, 'dataSlice.title', 'Text');
  const style = _.get(data, 'dataSlice.style', {});
  const variableName = _.get(data, 'dataSlice.variableName', '');
  console.log('🚀 ~ variableName:', variableName);
  const newStyle: CSSProperties = {
    ...(typeof style === 'object' && style !== null ? style : {}),
  };
  const { findVariable, updateDocumentVariable } = stateManagementStore();
  const variableChange = findVariable({ type: 'componentState', name: variableName });

  console.log('🚀 ~ variableChange:', variableChange);
  const updateVarialbe = _.debounce((key, value) => {
    updateDocumentVariable({
      type: 'componentState',
      dataUpdate: { key, value },
    });
  }, 300);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!variableName) return;
    const value = e.target.value;

    updateVarialbe(variableName, value);
  };

  return <input type="text" defaultValue={title} style={newStyle} onChange={handleInputChange} />;
};

export default InputText;
