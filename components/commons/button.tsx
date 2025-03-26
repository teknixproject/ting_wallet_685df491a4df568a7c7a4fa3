'use client';

import axios from 'axios';
import _ from 'lodash';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CSSProperties, useEffect } from 'react';
import styled from 'styled-components';

import { actionsStore, apiResourceStore, stateManagementStore } from '@/stores';
import { variableUtil } from '@/uitls';

import { GridItem } from '../grid-systems/const';

interface StylesProps {
  style?: {
    hover?: CSSProperties;
    [key: string]: any;
  };
}

interface ButtonCompoProps {
  data?: GridItem;
  style?: CSSProperties;
}

const Button = ({ data, style }: ButtonCompoProps) => {
  const title = _.get(data, 'dataSlice.title', 'Button');
  const iconStart = _.get(data, 'dataSlice.iconStart', null);
  const iconEnd = _.get(data, 'dataSlice.iconEnd', null);
  const link = _.get(data, 'dataSlice.link', '');
  const route = _.get(data, 'dataSlice.route', '');
  const searchParam = useSearchParams();
  const router = useRouter();

  const { isUseVariable, extractAllValuesFromTemplate } = variableUtil;
  const uid = searchParam.get('uid');

  const { findApiResourceValue } = apiResourceStore((state) => state);
  const { getActionsByComponentId } = actionsStore();
  const { findVariable, updateDocumentVariable } = stateManagementStore();

  const isButtonGradient = _.get(data, 'isBtnGradient', false);

  useEffect(() => {
    if (!data) return;
    const action = getActionsByComponentId(data?.id ?? '');
    console.log('🚀 ~ useEffect ~ action:', action);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleActionClick = async () => {
    if (!data) return;
    //kiểm tra có action hay không
    const action = getActionsByComponentId(data?.id ?? '');
    console.log('🚀 ~ handleActionClick ~ action:', action);
    if (action?.type === 'apiCall' && action?.data?.apiId) {
      //nếu là api thì tìm trong store có api này không
      const apiCall = findApiResourceValue(uid ?? '', action?.data?.apiId ?? '');

      const variables: any = {};
      const convertVariablesAction = () => {
        if (_.isEmpty(action?.data?.variables)) return;
        action.data?.variables.forEach((variable) => {
          if (isUseVariable(variable.value)) {
            const key = extractAllValuesFromTemplate(variable.value);
            console.log('🚀 ~ action.data?.variables.forEach ~ key:', key);
            const valueInStore = findVariable({
              type: 'componentState',
              name: key ?? '',
            });
            console.log('🚀 ~ action.data?.variables.forEach ~ valueInStore:', valueInStore);
            variables[variable.key] = valueInStore?.value;
          } else variables[variable.key] = variable.value;
        });
      };
      convertVariablesAction();
      console.log('🚀 ~ handleActionClick ~ variables:', variables);

      //lấy dữ liệu trong body
      const convertBody = (body: any) => {
        if (typeof body === 'string') {
          return body;
        }
        if (typeof body === 'object') {
          const bodyConvert: any = {};
          Object.entries(body).forEach(([key, value]) => {
            console.log('🚀 ~ bodyConvert ~ key, value:', key, value);
            if (isUseVariable(value)) {
              //nếu có dạng {{variableName}} thì lấy variableName
              const variableName = extractAllValuesFromTemplate(value as string);
              if (variableName) {
                console.log('🚀 ~ bodyConvert ~ variableName:', variableName);
                // kiểm tra trong action variable có định nghĩa biến nào khác không

                bodyConvert[key] = variables[variableName];
                return;
              }
              bodyConvert[key] = value;
            }
          });
          return bodyConvert;
        }
        return body;
      };
      const newBody = convertBody(apiCall?.body);
      console.log('🚀 ~ handleActionClick ~ newBody:', newBody);
      const result = (
        await axios.request({
          method: apiCall?.method.toUpperCase(),
          url: apiCall?.url,
          headers: apiCall?.headers || { 'Content-Type': 'application/json' },
          data: { ...newBody },
        })
      ).data;
      console.log('🚀 ~ handleActionClick ~ result:', result);

      if (action?.data?.output?.variableName) {
        const keyOutput = extractAllValuesFromTemplate(action?.data?.output?.variableName);
        const variableInStore = findVariable({
          type: 'appState',
          name: keyOutput ?? '',
        });

        const dataStore = updateDocumentVariable({
          type: 'appState',
          dataUpdate: {
            ...variableInStore,
            value: result,
          },
        });
        console.log('🚀 ~ handleActionClick ~ dataStore:', dataStore);
      }
    }
  };
  const handleRouteClick = () => {
    if (route) {
      router.push(route);
    }
  };

  if (isButtonGradient) {
    return (
      <button
        type="button"
        className="transition group flex items-center justify-center rounded-full bg-gradient-to-r from-[#1ECC97] to-[#5A60FC] p-[1.5px] text-[#1ECC97] duration-300 hover:shadow-2xl hover:shadow-purple-600/30"
      >
        <div className="px-[24px] py-[14px] max-sm:px-[16px] max-sm:py-[16px] text-[#1ECC97] flex h-full w-full items-center justify-center rounded-full bg-white transition duration-300 ease-in-out group-hover:bg-gradient-to-br group-hover:from-gray-700 group-hover:to-gray-900">
          Get Now
        </div>
      </button>
    );
  }

  return link ? (
    <Link href={link} passHref>
      <div style={style} className="!text-16-500 rounded-full flex items-center gap-2 text-center">
        {iconStart && <span className="icon-start">{iconStart}</span>}
        <span>{title}</span>
        {iconEnd && <span className="icon-end">{iconEnd}</span>}
      </div>
    </Link>
  ) : (
    <CsButton
      type="button"
      style={style}
      onClick={route ? handleRouteClick : handleActionClick}
      className="cursor-pointer"
    >
      {iconStart && <span className="icon-start">{iconStart}</span>}
      <span>{title}</span>
      {iconEnd && <span className="icon-end">{iconEnd}</span>}
    </CsButton>
  );
};

const flexCenter = {
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center',
};

const CsButton = styled.button<StylesProps>`
  ${(props) =>
    _.get(props, 'style.after')
      ? Object.entries(flexCenter)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n')
      : ''}

  &:hover {
    ${(props) =>
      props.style?.hover
        ? Object.entries(props.style.hover)
            .map(([key, value]) => `${key}: ${value} !important;`)
            .join('\n')
        : ''}
  }

  &::before {
    ${(props) =>
      props.style?.before
        ? Object.entries(props.style.before)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')
        : ''}
  }

  &::after {
    ${(props) =>
      props.style?.after
        ? Object.entries(props.style.after)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')
        : ''}
  }
`;

export default Button;
