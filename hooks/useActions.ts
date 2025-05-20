/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  TAction,
  TActionApiCall,
  TActionNavigate,
  TActionUpdateState,
  TConditional,
  TTriggerActions,
  TTriggerValue,
} from '@/types';
import { GridItem } from '@/types/gridItem';

import { useApiCallAction } from './useApiCallAction';
import { useConditionAction } from './useConditionAction';
import { useNavigateAction } from './useNavigateAction';
import { useUpdateStateAction } from './useUpdateStateAction';

export type TUseActions = {
  handleAction: (triggerType: TTriggerValue) => Promise<void>;
};

export const useActions = (data?: GridItem): TUseActions => {
  const [triggerName, setTriggerName] = useState<TTriggerValue>('onClick');
  const actions = useMemo(() => _.get(data, 'actions') as TTriggerActions, [data]);

  const executeActionFCType = async (action?: TAction): Promise<void> => {
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
  };

  const { handleApiCallAction } = useApiCallAction({ actions, triggerName, executeActionFCType });
  const { executeConditional } = useConditionAction({ actions, triggerName, executeActionFCType });
  const { handleUpdateStateAction } = useUpdateStateAction({
    actions,
    triggerName,
    executeActionFCType,
  });
  const { handleNavigateAction } = useNavigateAction({ actions, triggerName, executeActionFCType });
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);
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
  if (!data)
    return {
      handleAction: () => Promise.resolve(),
    };
  return { handleAction };
};
