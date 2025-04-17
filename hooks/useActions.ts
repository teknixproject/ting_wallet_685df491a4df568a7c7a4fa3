import axios from 'axios';
import _ from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiResourceStore, stateManagementStore } from '@/stores';
import {
  TAction,
  TActionApiCall,
  TActionNavigate,
  TActionUpdateState,
  TActionVariable,
  TTriggerActions,
  TTriggerValue,
  TVariable,
} from '@/types';
import { GridItem } from '@/types/gridItem';
import { variableUtil } from '@/uitls';

const { isUseVariable, extractAllValuesFromTemplate } = variableUtil;
const NEXT_PUBLIC_DEFAULT_UID = process.env.NEXT_PUBLIC_DEFAULT_UID;

export type TUseActions = {
  handleAction: (triggerType: TTriggerValue) => Promise<void>;
};

export const useActions = (data?: GridItem): TUseActions => {
  const searchParam = useSearchParams();
  const uid = searchParam.get('uid') || NEXT_PUBLIC_DEFAULT_UID;
  const router = useRouter();

  const { findApiResourceValue } = apiResourceStore((state) => state);
  const { findVariable, updateDocumentVariable } = stateManagementStore();

  //#region Action Handlers
  const convertActionVariables = (actionVariables: TActionVariable[]): Record<string, any> => {
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

  const convertApiCallBody = (body: any, variables: Record<string, any>): any => {
    if (typeof body === 'string') return body;
    if (typeof body !== 'object') return body;

    return Object.entries(body).reduce((acc, [key, value]) => {
      if (isUseVariable(value)) {
        const variableName = extractAllValuesFromTemplate(value as string);
        if (variableName) {
          acc[key] = variables[variableName];
          return acc;
        }
      }
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  };

  const handleApiResponse = (
    result: any,
    outputConfig: { variableName?: string; jsonPath?: string }
  ) => {
    console.log('🚀 ~ useActions ~ outputConfig:', outputConfig);
    if (!outputConfig?.variableName) return;

    const variableName = extractAllValuesFromTemplate(outputConfig.variableName as string);
    // let variableInStore = {};
    // if (isUseVariable(outputConfig.variableName)) {
    //   console.log('🚀 ~ useActions ~ variableName:', variableName);
    //   variableInStore =
    //     findVariable({
    //       type: 'appState',
    //       name: variableName,
    //     }) || {};
    //   console.log('🚀 ~ useActions ~ variableInStore:', variableInStore);
    // } else {
    //   const keyOutput = outputConfig.variableName;
    //   variableInStore =
    //     findVariable({
    //       type: 'appState',
    //       name: keyOutput,
    //     }) || {};
    // }
    // if (_.isEmpty(variableInStore)) return;

    let value = result;
    if (outputConfig.jsonPath) {
      try {
        value = _.get(result, outputConfig.jsonPath, result);
      } catch (error) {
        console.error('Failed to extract value with jsonPath:', error);
      }
    }
    console.log('🚀 ~ useActions ~ value:', value);

    updateDocumentVariable({
      type: 'appState',
      dataUpdate: {
        key: variableName,
        value,
      },
    });
  };

  const makeApiCall = async (apiCall: any, body: any): Promise<any> => {
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

  const handleApiCallAction = async (action: TAction<TActionApiCall>): Promise<void> => {
    const apiCall = findApiResourceValue(uid ?? '', action?.data?.apiId ?? '');
    if (!apiCall) return;

    const variables = convertActionVariables(action?.data?.variables ?? []);
    console.log('🚀 ~ handleApiCallAction ~ variables:', variables);
    const newBody = convertApiCallBody(apiCall?.body, variables);
    const result = await makeApiCall(apiCall, newBody);

    handleApiResponse(result, action?.data?.output ?? {});

    if (action.success) {
      await executeActionById(action.success);
    }
  };

  const handleUpdateStateAction = async (action: TAction<TActionUpdateState>): Promise<void> => {
    const updates = action?.data?.update;
    if (_.isEmpty(updates)) return;

    for (const item of updates || []) {
      let variableInStore: TVariable | undefined;
      let valueInStore;

      if (isUseVariable(item.key)) {
        const key = extractAllValuesFromTemplate(item.key);
        variableInStore = findVariable({
          type: item.keyStore,
          name: key,
        });

        if (!variableInStore) continue;

        if (isUseVariable(item.value)) {
          const valueKey = extractAllValuesFromTemplate(item.value);
          valueInStore = findVariable({
            type: item.valueStore,
            name: valueKey,
          });
          variableInStore.value = valueInStore?.value ?? '';
        } else {
          variableInStore.value = item.value ?? '';
        }

        await updateDocumentVariable({
          type: item.keyStore,
          dataUpdate: variableInStore,
        });
      }
    }

    if (action.success) {
      await executeActionById(action.success);
    }
  };

  const handleNavigateAction = (action: TAction<TActionNavigate>): void => {
    if (action?.data?.url) {
      router.push(action.data.url);
    }
  };
  //#endregion

  //#region Action Execution
  const executeActionById = async (actionId: string): Promise<void> => {
    // You'll need to implement a way to get the action by ID
    // This is a placeholder - replace with your actual implementation
    const action = {} as TAction; // Replace with actual action lookup
    await executeAction(action);
  };

  const executeAction = async (action: TAction): Promise<void> => {
    if (!action) return;

    try {
      switch (action.type) {
        case 'navigate':
          handleNavigateAction(action as TAction<TActionNavigate>);
          break;
        case 'apiCall':
          await handleApiCallAction(action as TAction<TActionApiCall>);
          break;
        case 'updateStateManagement':
          await handleUpdateStateAction(action as TAction<TActionUpdateState>);
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Error executing action ${action.id}:`, error);
      if (action.error) {
        await executeActionById(action.error);
      }
    }
  };

  const executeTriggerActions = async (
    actions: TTriggerActions,
    triggerType: TTriggerValue
  ): Promise<void> => {
    const triggerActions = actions[triggerType];
    if (!triggerActions) return;

    for (const actionId in triggerActions) {
      if (Object.prototype.hasOwnProperty.call(triggerActions, actionId)) {
        await executeAction(triggerActions[actionId]);
      }
    }
  };
  //#endregion

  const handleAction = async (triggerType: TTriggerValue): Promise<void> => {
    if (!data?.actions) return;
    await executeTriggerActions(data.actions, triggerType);
  };

  return {
    handleAction,
  };
};
