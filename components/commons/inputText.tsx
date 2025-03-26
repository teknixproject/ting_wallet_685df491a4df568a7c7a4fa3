import _ from 'lodash';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { CSSProperties } from 'styled-components';

import { stateManagementStore } from '@/stores/stateManagement';
import { variableUtil } from '@/uitls';

import { GridItem } from '../grid-systems/const';

type Props = { data: GridItem };

const InputText: React.FC<Props> = ({ data }) => {
  const [title, setTitle] = useState(_.get(data, 'dataSlice.title', 'Text'));
  const style = _.get(data, 'dataSlice.style', {});
  const newStyle: CSSProperties = {
    ...style,
    position: 'initial',
    transform: '',
    margin: 0,
    padding: 0,
    maxHeight: '',
    maxWidth: '',
    width: '100%',
    height: '100%',
  };
  const variableName = _.get(data, 'dataSlice.variableName', '');
  console.log('🚀 ~ variableName:', variableName);

  const { findVariable, updateDocumentVariable, componentState } = stateManagementStore();
  const variableChange = findVariable({ type: 'componentState', name: variableName });
  const { extractAllValuesFromTemplate } = variableUtil;
  console.log('🚀 ~ variableChange:', variableChange);
  const updateVarialbe = _.debounce((key, value) => {
    updateDocumentVariable({
      type: 'componentState',
      dataUpdate: { key, value },
    });
  }, 300);

  useEffect(() => {
    if (!variableName) return;

    setTitle(findVariable({ type: 'componentState', name: variableName })?.value ?? 'Text');
  }, [componentState]);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!variableName) return;
    const key = extractAllValuesFromTemplate(variableName);
    const value = e.target.value;

    updateVarialbe(key, value);
  };

  return <input type="text" defaultValue={title} style={newStyle} onChange={handleInputChange} />;
};

export default InputText;
