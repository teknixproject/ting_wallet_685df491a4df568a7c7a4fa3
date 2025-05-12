/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import _ from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { stateManagementStore } from '@/stores';
import {
  TAction,
  TActionApiCall,
  TActionNavigate,
  TActionUpdateState,
  TActionVariable,
  TConditional,
  TConditionalChild,
  TTriggerActions,
  TTriggerValue,
} from '@/types';
import { GridItem } from '@/types/gridItem';
import { variableUtil } from '@/uitls';

import { useApiCall } from './useApiCall';

const { isUseVariable, extractAllValuesFromTemplate } = variableUtil;

export type TUseActions = {
  handleAction: (triggerType: TTriggerValue) => Promise<void>;
};

export const useActions = (data?: GridItem): TUseActions => {
  const pathname = usePathname();
  const { getApiMember } = useApiCall();
  console.log('🚀 ~ useActions ~ pathname:', pathname);
  const router = useRouter();

  // State management
  const apiResponsesRef = useRef<Record<string, any>>({});
  const [triggerName, setTriggerName] = useState<TTriggerValue>('onClick');

  // Store hooks
  const { findVariable, updateDocumentVariable } = stateManagementStore();

  // Memoized actions from data
  const actions = useMemo(() => _.get(data, 'actions') as TTriggerActions, [data]);

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  //#region Action Handlers
  const convertActionVariables = useCallback(
    (actionVariables: TActionVariable[]): Record<string, any> => {
      if (_.isEmpty(actionVariables)) return {};

      return actionVariables.reduce((acc, variable) => {
        acc[variable.key] = isUseVariable(variable.value)
          ? findVariable({
              type: variable.store,
              name: extractAllValuesFromTemplate(variable.value) ?? '',
            })?.value
          : variable.value;
        return acc;
      }, {} as Record<string, any>);
    },
    [findVariable]
  );

  const convertApiCallBody = useCallback((body: any, variables: Record<string, any>): any => {
    if (typeof body === 'string') return body;
    if (typeof body !== 'object') return body;

    return Object.entries(body).reduce((acc, [key, value]) => {
      acc[key] = isUseVariable(value)
        ? variables[extractAllValuesFromTemplate(value as string) ?? key]
        : value;
      return acc;
    }, {} as Record<string, any>);
  }, []);

  const handleApiResponse = useCallback(
    (result: any, outputConfig: { variableName?: string; jsonPath?: string }) => {
      if (!outputConfig?.variableName) return;

      const variableName = extractAllValuesFromTemplate(outputConfig.variableName as string);
      const value = outputConfig.jsonPath ? _.get(result, outputConfig.jsonPath, result) : result;

      updateDocumentVariable({
        type: 'appState',
        dataUpdate: { key: variableName, value },
      });
    },
    [updateDocumentVariable]
  );

  const makeApiCall = async (
    apiCall: any,
    body: any,
    outputVariable: { variableName?: string; jsonPath?: string }
  ): Promise<any> => {
    const keyOutput = isUseVariable(outputVariable.variableName)
      ? extractAllValuesFromTemplate(outputVariable.variableName as string)
      : outputVariable.variableName || '';

    try {
      const response = await axios.request({
        method: apiCall?.method?.toUpperCase(),
        url: apiCall?.url,
        headers: apiCall?.headers || { 'Content-Type': 'application/json' },
        data: body,
      });

      // await setApiResponses((prev) => ({ ...prev, [keyOutput]: 'success' }));
      apiResponsesRef.current[keyOutput] = 'success';
      return response.data;
    } catch (error) {
      console.log('API call failed:', error);
      apiResponsesRef.current[keyOutput] = 'error';
      return error;
    }
  };

  const handleApiCallAction = async (action: TAction<TActionApiCall>): Promise<void> => {
    const apiCall = getApiMember(action?.data?.apiId ?? '');
    console.log('🚀 ~ handleApiCallAction ~ apiCall:', apiCall);

    if (!apiCall) return;

    const variables = convertActionVariables(action?.data?.variables ?? []);
    const newBody = convertApiCallBody(apiCall?.body, variables);
    const result = await makeApiCall(apiCall, newBody, action?.data?.output ?? {});

    handleApiResponse(result, action?.data?.output ?? {});

    if (result && action?.next) {
      await executeActionFCType(getActionById(action.next));
    }
  };

  const handleUpdateStateAction = async (action: TAction<TActionUpdateState>): Promise<void> => {
    const updates = action?.data?.update;
    if (_.isEmpty(updates)) return;

    for (const item of updates || []) {
      if (!isUseVariable(item.key)) continue;

      const key = extractAllValuesFromTemplate(item.key);
      const variableInStore = findVariable({ type: item.keyStore, name: key });
      if (!variableInStore) continue;

      variableInStore.value = isUseVariable(item.value)
        ? findVariable({
            type: item.valueStore,
            name: extractAllValuesFromTemplate(item.value) ?? '',
          })?.value ?? ''
        : item.value ?? '';

      await updateDocumentVariable({ type: item.keyStore, dataUpdate: variableInStore });
    }

    if (action?.next) {
      await executeActionFCType(getActionById(action.next));
    }
  };

  const handleNavigateAction = async (action: TAction<TActionNavigate>): Promise<void> => {
    const { url, isExternal, isNewTab } = action?.data || {};
    console.log(`🚀 ~ handleNavigateAction ~ { url, isExternal, isNewTab }:`, {
      url,
      isExternal,
      isNewTab,
    });
    if (!url) return;

    if (isNewTab) {
      window.open(url, '_blank');
    } else if (isExternal) {
      window.location.href = url;
    } else {
      router.push(url);
    }

    if (action?.next) {
      await executeActionFCType(getActionById(action.next));
    }
  };
  //#endregion

  //#region Action Execution
  const evaluateCondition = (condition: TConditionalChild): boolean => {
    console.log('🚀 ~ evaluateCondition ~ condition:', condition);

    const { firstValue, secondValue, operator } = condition;
    const firstVal = isUseVariable(firstValue)
      ? findVariable({ type: 'appState', name: extractAllValuesFromTemplate(firstValue) ?? '' })
          ?.value
      : apiResponsesRef.current[firstValue];

    const secondVal = isUseVariable(secondValue)
      ? findVariable({ type: 'appState', name: extractAllValuesFromTemplate(secondValue) ?? '' })
          ?.value
      : secondValue;

    if (firstVal === undefined || secondVal === undefined) return false;

    switch (operator) {
      case 'equal':
        return firstVal == secondVal;
      case 'notEqual':
        return firstVal !== secondVal;
      case 'greaterThan':
        return Number(firstVal) > Number(secondVal);
      case 'lessThan':
        return Number(firstVal) < Number(secondVal);
      case 'greaterThanOrEqual':
        return Number(firstVal) >= Number(secondVal);
      case 'lessThanOrEqual':
        return Number(firstVal) <= Number(secondVal);
      default:
        return false;
    }
  };

  const getActionById = (id: string): TAction | undefined => {
    return actions[triggerName]?.[id];
  };

  const executeAction = async (action: TAction): Promise<void> => {
    if (!action) return;

    try {
      switch (action.type) {
        case 'navigate':
          return handleNavigateAction(action as TAction<TActionNavigate>);
        case 'apiCall':
          return handleApiCallAction(action as TAction<TActionApiCall>);
        case 'updateStateManagement':
          return handleUpdateStateAction(action as TAction<TActionUpdateState>);
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Error executing action ${action.id}:`, error);
    }
  };
  const executeActionFCType = async (action?: TAction): Promise<void> => {
    if (!action?.fcType) return;

    switch (action.fcType) {
      case 'action':
        await executeAction(action);
        break;
      case 'conditional':
        await executeConditional(action as TAction<TConditional>);
        break;
      default:
        console.warn(`Unknown fcType: ${action.fcType}`);
    }
  };
  const executeConditional = async (action: TAction<TConditional>): Promise<void> => {
    const conditions = action?.data?.conditions || [];
    if (_.isEmpty(conditions)) return;

    for (const condition of conditions) {
      const conditionChild = getActionById(condition) as TAction<TConditionalChild>;
      if (!conditionChild?.data) continue;

      console.log('API RESPONSE', apiResponsesRef);

      const isConditionMet = evaluateCondition(conditionChild.data);
      console.log('🚀 ~ executeConditional ~ isConditionMet:', isConditionMet);
      console.log(
        '🚀 ~ executeConditional ~ conditionChild.data.equal:',
        conditionChild.data.equal
      );
      if (isConditionMet) {
        if (conditionChild.next) {
          await executeActionFCType(getActionById(conditionChild.next));
        }
        return; // Exit after first matching condition
      }
    }
  };

  const executeTriggerActions = async (
    triggerActions: TTriggerActions,
    triggerType: TTriggerValue
  ): Promise<void> => {
    const actionsToExecute = triggerActions[triggerType];
    if (!actionsToExecute) return;

    // Find and execute the root action (parentId === null)
    const rootAction = Object.values(actionsToExecute).find((action) => !action.parentId);
    console.log('🚀 ~ useActions ~ rootAction:', rootAction);
    if (rootAction) {
      await executeActionFCType(rootAction);
    }
  };

  const handleAction = useCallback(
    async (triggerType: TTriggerValue): Promise<void> => {
      if (!data?.actions) return;
      setTriggerName(triggerType);
      await executeTriggerActions(data.actions, triggerType);
    },
    [data?.actions, executeTriggerActions]
  );

  useEffect(() => {
    if (mounted.current && !_.isEmpty(actions) && 'onPageLoad' in actions) {
      console.log("🚀 ~ useEffect ~ 'onPageLoad' in actions:", 'onPageLoad' in actions);

      handleAction('onPageLoad');
    }
  }, [mounted.current]);

  return { handleAction };
};
