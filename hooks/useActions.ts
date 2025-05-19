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
  TApiCallValue,
  TApiCallVariable,
  TConditional,
  TConditionalChild,
  TConditionChildMap,
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

const evaluateCondition = (firstValue: any, secondValue: any, operator: string): boolean => {
  switch (operator) {
    case 'equal':
      return firstValue == secondValue;
    case 'notEqual':
      return firstValue !== secondValue;
    case 'greaterThan':
      return Number(firstValue) > Number(secondValue);
    case 'lessThan':
      return Number(firstValue) < Number(secondValue);
    case 'greaterThanOrEqual':
      return Number(firstValue) >= Number(secondValue);
    case 'lessThanOrEqual':
      return Number(firstValue) <= Number(secondValue);
    default:
      return false;
  }
};

const getValueOfConditionChild = (conditions: any, conditionItemId: string) => {
  return conditions[conditionItemId];
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
  const { findVariable, updateVariables } = stateManagementStore();

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
    (actionVariables: TActionVariable[], apiCall: TApiCallValue): any[] => {
      console.log('🚀 ~ useActions ~ apiCall:', apiCall);
      console.log('🚀 ~ useActions ~ actionVariables:', actionVariables);
      if (_.isEmpty(actionVariables)) return [];

      return actionVariables.map((item) => {
        const { firstValue, secondValue } = item;

        const data = apiCall?.variables?.find((item) => item.id === firstValue.variableId);

        if (!data) return;

        if (secondValue.variableId) {
          const valueInStore = findVariable({
            type: secondValue.typeStore,
            id: secondValue.variableId,
          });
          data.value = valueInStore?.value || '';
        }
        if (secondValue.value) {
          data.value = secondValue.value;
        }

        return data;
      });
    },
    [findVariable]
  );

  const convertApiCallBody = useCallback((body: any, variables: Record<string, any>): any => {
    if (typeof body === 'string') return body;
    if (typeof body !== 'object') return body;

    console.log('🚀 ~ convertApiCallBody ~ body:', body);
    return Object.entries(body).reduce((acc, [key, value]) => {
      acc[key] = isUseVariable(value)
        ? variables.find(
            (item: TApiCallVariable) => item.key === extractAllValuesFromTemplate(value as string)
          )?.value
        : value;
      return acc;
    }, {} as Record<string, any>);
  }, []);

  const handleApiResponse = useCallback(
    (result: any, outputConfig: { variableId?: string; jsonPath?: string }) => {
      if (!outputConfig?.variableId) return;

      const value = outputConfig.jsonPath ? _.get(result, outputConfig.jsonPath, result) : result;

      const variable = findVariable({
        type: 'apiResponse',
        id: outputConfig.variableId,
      });
      if (!variable) return;
      updateVariables({
        type: 'apiResponse',
        dataUpdate: {
          ...variable,
          value,
        },
      });
    },
    [updateVariables]
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

    const variables = convertActionVariables(action?.data?.variables ?? [], apiCall);
    const newBody = convertApiCallBody(apiCall?.body, variables);
    console.log('🚀 ~ handleApiCallAction ~ newBody:', newBody);
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
      const variableFirst = findVariable({
        type: item.firstState.typeStore,
        id: item.firstState.variableId,
      });

      const variableSecond = findVariable({
        type: item.secondState.typeStore,
        id: item.secondState.variableId,
      });
      if (!variableFirst) return;

      variableFirst.value = item.secondState.variableId
        ? variableSecond?.value ?? ''
        : item.secondState.value ?? '';

      updateVariables({
        type: item.firstState.typeStore,
        dataUpdate: variableFirst,
      });
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

  const getRootConditionChild = (condition: TConditionChildMap): TConditionalChild | undefined => {
    return Object.values(condition.childs).find((child) => !child.parentId);
  };
  const getConditionChild = (conditionId: string, condition: TConditionChildMap) => {
    return condition.childs[conditionId];
  };

  const getCompareValue = (compare: TConditionalChild['compare']): boolean => {};
  const handleCompareCondition = (
    conditionChildId: string,
    condition: TConditionChildMap
  ): boolean => {
    const conditionChild = getConditionChild(conditionChildId, condition);

    if (conditionChild.type === 'compare') {
      return getCompareValue(conditionChild.compare);
    }

    let firstValue;
    let secondValue;

    if (conditionChild.fistCondition) {
      firstValue = handleCompareCondition(conditionChild.fistCondition, condition);
    }

    if (conditionChild.secondCondition) {
      secondValue = handleCompareCondition(conditionChild.secondCondition, condition);
    }

    if (conditionChild.logicOperator === 'and') {
      return !!(firstValue && secondValue);
    }
    if (conditionChild.logicOperator === 'or') {
      return !!(firstValue || secondValue);
    }
    return !!(firstValue && secondValue);
  };
  //#region Action Execution

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
      const conditionChild = getActionById(condition) as TAction<TConditionChildMap>;
      if (!conditionChild?.data) continue;

      const rootCondition = getRootConditionChild(conditionChild.data as TConditionChildMap);
      const isConditionMet = handleCompareCondition(
        rootCondition?.id as string,
        conditionChild.data
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
