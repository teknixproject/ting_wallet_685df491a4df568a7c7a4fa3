/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import React, { ChangeEvent, useMemo } from 'react';
import { CSSProperties } from 'styled-components';

import { useData } from '@/hooks';
import { cn } from '@/lib/utils';
import { stateManagementStore } from '@/stores/stateManagement';
import { GridItem } from '@/types/gridItem';
import { variableUtil } from '@/uitls';
import { Icon } from '@iconify/react/dist/iconify.js';

type Props = { data: GridItem };

const InputText: React.FC<Props> = ({ data }) => {
  const { title } = useData({ layoutData: data });
  const style = _.get(data, 'dataSlice.style', {});
  const newStyle: CSSProperties = {
    ...style,
    position: 'initial',
    transform: '',
    margin: 0,
    padding: '5px',
    maxHeight: '',
    maxWidth: '',
    minHeight: '24px',
    width: '100%',
    height: '100%',
  };
  const variableName = _.get(data, 'dataSlice.variableName', '');

  const startIcon = useMemo(() => {
    return data?.inputText?.startIcon || 'hugeicons:refresh';
  }, [data?.inputText]);
  const endIcon = useMemo(() => {
    return data?.inputText?.startIcon || 'hugeicons:baseball';
  }, [data?.inputText]);

  const { findVariable, updateDocumentVariable, componentState } = stateManagementStore();
  const { extractAllValuesFromTemplate } = variableUtil;
  const updateVarialbe = _.debounce((key, value) => {
    updateDocumentVariable({
      type: 'componentState',
      dataUpdate: { key, value },
    });
  }, 300);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!variableName) return;
    const key = extractAllValuesFromTemplate(variableName);
    const value = e.target.value;

    updateVarialbe(key, value);
  };
  return (
    <div className="w-full flex items-center gap-1">
      {startIcon && (
        <div className="">
          <Icon icon={startIcon} width="24" height="24" />
        </div>
      )}
      <input
        className={cn('w-full h-full outline-none')}
        style={newStyle}
        onChange={handleInputChange}
      />
      {endIcon && (
        <div className="">
          <Icon icon={endIcon} width="24" height="24" />
        </div>
      )}
    </div>
  );
};
export default InputText;
