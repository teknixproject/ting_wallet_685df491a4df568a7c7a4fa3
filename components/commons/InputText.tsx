/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import React, { ChangeEvent, useMemo } from 'react';
import styled, { css, CSSProperties } from 'styled-components';

import { useData } from '@/hooks';
import { useActions } from '@/hooks/useActions';
// import { useData } from '@/hooks';
import { cn } from '@/lib/utils';
import { stateManagementStore } from '@/stores/stateManagement';
import { GridItem } from '@/types/gridItem';
import { variableUtil } from '@/uitls';
import { Icon } from '@iconify/react/dist/iconify.js';

type Props = { data: GridItem };

const InputText: React.FC<Props> = ({ data }) => {
  const { title } = useData({ layoutData: data });
  const { handleAction } = useActions(data);
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

  const prefixIcon = useMemo(() => {
    return data?.inputText?.prefixIcon;
  }, [data?.inputText]);
  const suffixIcon = useMemo(() => {
    return data?.inputText?.suffixIcon;
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
  const handleEnter = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAction('onEnter');
    }
  };
  return (
    <div className="w-full flex items-center gap-1">
      {prefixIcon && (
        <div className="">
          <Icon icon={prefixIcon} width="24" height="24" />
        </div>
      )}
      <CsInput
        className={cn('w-full h-full outline-none')}
        style={newStyle}
        onChange={handleInputChange}
        defaultValue={title as string}
        onKeyDown={handleEnter}
        styledComponentCss={data?.styledComponentCss}
      />
      {suffixIcon && (
        <div className="">
          <Icon icon={suffixIcon} width="24" height="24" />
        </div>
      )}
    </div>
  );
};

interface StylesProps {
  style?: {
    hover?: CSSProperties;
    [key: string]: any;
  };
  styledComponentCss?: string;
}

const CsInput = styled.input<StylesProps>`
  ${(props) =>
    props.styledComponentCss
      ? css`
          ${props.styledComponentCss}
        `
      : ''}
`;

export default InputText;
