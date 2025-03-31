import axios from 'axios';
import _ from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';

import { actionsStore, apiResourceStore, stateManagementStore } from '@/stores';
import {
    TActionApiCall, TActionNavigate, TActions, TActionUpdateState, TActionVariable, TVariable
} from '@/types';
import { GridItem } from '@/types/gridItem';
import { variableUtil } from '@/uitls';

const { isUseVariable, extractAllValuesFromTemplate } = variableUtil;
const NEXT_PUBLIC_DEFAULT_UID = process.env.NEXT_PUBLIC_DEFAULT_UID;
export type TUseActions = {
  handleActionClick: () => Promise<void>;
};

export const useActions = (data?: GridItem): TUseActions => {
  const searchParam = useSearchParams();
  const uid = searchParam.get('uid') || NEXT_PUBLIC_DEFAULT_UID;
  const router = useRouter();

  const { findApiResourceValue } = apiResourceStore((state) => state);
  const { getActionsByComponentId } = actionsStore();
  const { findVariable, updateDocumentVariable } = stateManagementStore();

  //#region Api Call
  const convertActionVariables = (actionVariables: TActionVariable[]) => {
    const variables: Record<string, any> = {};
    if (_.isEmpty(actionVariables)) return variables;

    actionVariables.forEach((variable) => {
      if (isUseVariable(variable.value)) {
        const key = extractAllValuesFromTemplate(variable.value);
        const valueInStore = findVariable({
          type: variable.store,
          name: key ?? '',
        });
        variables[variable.key] = valueInStore?.value;
      } else {
        variables[variable.key] = variable.value;
      }
    });

    return variables;
  };

  const convertApiCallBody = (body: any, variables: Record<string, any>) => {
    if (typeof body === 'string') {
      return body;
    }

    if (typeof body === 'object') {
      const bodyConvert: Record<string, any> = {};

      Object.entries(body).forEach(([key, value]) => {
        if (isUseVariable(value)) {
          const variableName = extractAllValuesFromTemplate(value as string);
          if (variableName) {
            bodyConvert[key] = variables[variableName];
            return;
          }
        }
        bodyConvert[key] = value;
      });

      return bodyConvert;
    }

    return body;
  };

  const handleApiResponse = (result: any, outputConfig: { variableName?: string }) => {
    if (outputConfig?.variableName) {
      const keyOutput = outputConfig.variableName;
      const variableInStore = findVariable({
        type: 'appState',
        name: keyOutput ?? '',
      });

      updateDocumentVariable({
        type: 'appState',
        dataUpdate: {
          ...variableInStore,
          value: result,
        },
      });
    }
  };

  const makeApiCall = async (apiCall: any, body: any): Promise<any> => {
    console.log('🚀 ~ makeApiCall ~ apiCall:', apiCall);
    try {
      const response = await axios.request({
        method: apiCall?.method?.toUpperCase(),
        url: apiCall?.url,
        headers: apiCall?.headers || { 'Content-Type': 'application/json' },
        data: body,
      });
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const handleWithApiCall = async (action: TActions<TActionApiCall>) => {
    const apiCall = findApiResourceValue(uid ?? '', action?.data?.apiId ?? '');
    if (!apiCall) return;

    // Process action variables
    const variables = convertActionVariables(action?.data?.variables ?? []);

    // Process API call body
    const newBody = convertApiCallBody(apiCall?.body, variables);

    // Make API call
    const result = await makeApiCall(apiCall, newBody);

    // Handle API response
    handleApiResponse(result, action?.data?.output ?? {});

    // If have child action
    if (action?.action?.id) redirectAction(action?.action);
  };

  const handleWithUpdateStateManagement = async (action: TActions<TActionUpdateState>) => {
    const update = action?.data?.update;
    if (_.isEmpty(update)) return;
    update?.forEach((item) => {
      let variableInStore: TVariable | undefined;
      let valueInStore;
      if (isUseVariable(item.key)) {
        const key = extractAllValuesFromTemplate(item.key);
        variableInStore = findVariable({
          type: item.keyStore,
          name: key,
        });

        if (!variableInStore) return;

        if (isUseVariable(item.value)) {
          const key = extractAllValuesFromTemplate(item.value);
          valueInStore = findVariable({
            type: item.valueStore,
            name: key,
          });
          item.value = valueInStore?.value ?? '';
          variableInStore.value = valueInStore?.value ?? '';
        } else {
          if (variableInStore) {
            variableInStore.value = item.value ?? '';
          }
        }
        // item.key = keyInStore?.key ?? '';
      }

      updateDocumentVariable({
        type: item.keyStore,
        dataUpdate: {
          ...variableInStore,
        },
      });
    });
  };

  const handleNavigate = (actions: TActions<TActionNavigate>) => {
    if (actions?.data?.url) {
      router.push(actions?.data?.url);
    }
  };

  const redirectAction = (action: TActions) => {
    switch (action?.type) {
      case 'navigate':
        handleNavigate(action as unknown as TActions<TActionNavigate>);
        break;
      case 'apiCall':
        handleWithApiCall(action as unknown as TActions<TActionApiCall>);
        break;
      case 'updateStateManagement':
        handleWithUpdateStateManagement(action as unknown as TActions<TActionUpdateState>);
      default:
        break;
    }
  };

  const handleActionClick = async () => {
    if (!data) return;

    const action = getActionsByComponentId(data?.id ?? '');
    if (data?.action?.pageId) {
      router.push(data?.action?.pageId);
    }
    if (action) redirectAction(action);
  };

  return { handleActionClick };
};
