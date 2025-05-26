/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { pageActionsStore } from '@/stores/pageActions';
import {
  TAction,
  TActionApiCall,
  TActionNavigate,
  TActionUpdateState,
  TConditional,
  TTriggerActions,
  TTriggerValue,
} from '@/types';

import { useApiCallAction } from './useApiCallAction';
import { useConditionAction } from './useConditionAction';
import { useNavigateAction } from './useNavigateAction';
import { useUpdateStateAction } from './useUpdateStateAction';

export type TUseActions = {
  multiples: Record<string, (triggerType?: TTriggerValue) => Promise<void>>;
};

export const usePageActions = (): TUseActions => {
  const { pageActions } = pageActionsStore();
  const triggerNameRef = useRef<TTriggerValue>('onClick');
  const mounted = useRef(false);

  // Create a map of all actions for quick lookup
  const actionsMap = useMemo(() => {
    const map: Record<string, TTriggerActions> = {};
    pageActions?.forEach((item) => {
      if (!_.isEmpty(item.actions)) {
        map[item.name] = item.actions;
      }
    });
    return map;
  }, [pageActions]);

  const executeActionFCType = useCallback(async (action?: TAction): Promise<void> => {
    if (!action?.fcType) return;

    switch (action.fcType) {
      case 'action':
        await executeAction(action as TAction<TActionApiCall>);
        break;
      case 'conditional':
        await executeConditional(action as TAction<TConditional>);
        break;
      default:
        console.warn(`Unknown fcType: ${action.fcType}`);
    }
  }, []);

  const { handleApiCallAction } = useApiCallAction({
    executeActionFCType,
    actions: actionsMap[triggerNameRef.current] || {},
    triggerName: triggerNameRef.current,
  });

  const { executeConditional } = useConditionAction({
    executeActionFCType,
    actions: actionsMap[triggerNameRef.current] || {},
    triggerName: triggerNameRef.current,
  });

  const { handleUpdateStateAction } = useUpdateStateAction({
    executeActionFCType,
    actions: actionsMap[triggerNameRef.current] || {},
    triggerName: triggerNameRef.current,
  });

  const { handleNavigateAction } = useNavigateAction({
    executeActionFCType,
    actions: actionsMap[triggerNameRef.current] || {},
    triggerName: triggerNameRef.current,
  });

  const executeAction = useCallback(
    async (action: TAction): Promise<void> => {
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
    },
    [handleApiCallAction, handleNavigateAction, handleUpdateStateAction]
  );

  const executeTriggerActions = useCallback(
    async (actions: TTriggerActions, triggerType: TTriggerValue): Promise<void> => {
      const actionsToExecute = actions[triggerType];
      if (!actionsToExecute) return;

      const rootAction = Object.values(actionsToExecute).find((action) => !action.parentId);
      if (rootAction) {
        await executeActionFCType(rootAction);
      }
    },
    [executeActionFCType]
  );

  const handleAction = useCallback(
    (actionName: string) =>
      async (triggerType: TTriggerValue = 'onClick'): Promise<void> => {
        if (!actionsMap[actionName]) return;
        triggerNameRef.current = triggerType;
        await executeTriggerActions(actionsMap[actionName], triggerType);
      },
    [actionsMap, executeTriggerActions]
  );

  useEffect(() => {
    mounted.current = true;

    // Run onPageLoad actions for all page actions
    pageActions?.forEach((item) => {
      if (!_.isEmpty(item.actions)) {
        const onPageLoadActions = item.actions.onPageLoad;
        if (onPageLoadActions) {
          const rootAction = Object.values(onPageLoadActions).find((a) => !a.parentId);
          if (rootAction) {
            executeActionFCType(rootAction);
          }
        }
      }
    });

    return () => {
      mounted.current = false;
    };
  }, [executeActionFCType, pageActions]);

  const multiples = useMemo(() => {
    const result: Record<string, (triggerType?: TTriggerValue) => Promise<void>> = {};

    pageActions?.forEach((item) => {
      if (!_.isEmpty(item.actions)) {
        result[item.name] = handleAction(item.name);
      }
    });

    return result;
  }, [handleAction, pageActions]);

  return { multiples };
};
