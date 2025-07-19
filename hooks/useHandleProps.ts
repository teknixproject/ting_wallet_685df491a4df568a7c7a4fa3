/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  TAction,
  TActionApiCall,
  TActionNavigate,
  TActionUpdateState,
  TConditional,
  TTriggerActions,
  TTriggerValue,
} from '@/types';

import { actionHookSliceStore } from './actionSliceStore';
import { useApiCallAction } from './useApiCallAction';
import { useConditionAction } from './useConditionAction';
import { useNavigateAction } from './useNavigateAction';
import { useUpdateStateAction } from './useUpdateStateAction';

// Types
interface TDataProps {
  name: string;
  type: any;
  data: TTriggerActions;
}

interface UseHandlePropsResult {
  actions: Record<string, React.MouseEventHandler<HTMLButtonElement>>;
}

interface UseHandlePropsProps {
  dataProps: TDataProps[];
  valueStream?: any;
}

// Constants
const ACTION_TYPES = {
  NAVIGATE: 'navigate',
  API_CALL: 'apiCall',
  UPDATE_STATE: 'updateStateManagement',
} as const;

const FC_TYPES = {
  ACTION: 'action',
  CONDITIONAL: 'conditional',
} as const;

const DEFAULT_TRIGGER: TTriggerValue = 'onClick';

export const useHandleProps = ({ dataProps }: UseHandlePropsProps): UseHandlePropsResult => {
  const triggerNameRef = useRef<TTriggerValue>(DEFAULT_TRIGGER);
  const previousActionsMapRef = useRef<Record<string, TTriggerActions>>({});

  const { setMultipleActions } = actionHookSliceStore();

  const actionsMap = useMemo(() => {
    const map: Record<string, TTriggerActions> = {};

    dataProps?.forEach((item) => {
      if (!_.isEmpty(item.data)) {
        map[item.name] = item.data;
      }
    });

    return map;
  }, [dataProps]);

  const executeActionFCType = useCallback(async (action?: TAction): Promise<void> => {
    if (!action?.fcType) return;

    try {
      switch (action.fcType) {
        case FC_TYPES.ACTION:
          await executeAction(action as TAction<TActionApiCall>);
          break;
        case FC_TYPES.CONDITIONAL:
          await executeConditional(action as TAction<TConditional>);
          break;
        default:
          console.warn(`Unknown fcType: ${action.fcType}`);
      }
    } catch (error) {
      console.error(`Error executing action with fcType ${action.fcType}:`, error);
    }
  }, []);

  const { handleApiCallAction } = useApiCallAction({
    executeActionFCType: executeActionFCType,
  });

  const { executeConditional } = useConditionAction({
    executeActionFCType: executeActionFCType,
  });

  const { handleUpdateStateAction } = useUpdateStateAction({
    executeActionFCType: executeActionFCType,
  });

  const { handleNavigateAction } = useNavigateAction({
    executeActionFCType: executeActionFCType,
  });

  const executeAction = useCallback(
    async (action: TAction): Promise<void> => {
      if (!action) return;

      try {
        switch (action.type) {
          case ACTION_TYPES.NAVIGATE:
            return handleNavigateAction(action as TAction<TActionNavigate>);
          case ACTION_TYPES.API_CALL:
            return handleApiCallAction(action as TAction<TActionApiCall>);
          case ACTION_TYPES.UPDATE_STATE:
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

      setMultipleActions({ actions, triggerName: triggerType });

      if (!actionsToExecute) return;

      const rootAction = Object.values(actionsToExecute).find((action) => !action.parentId);
      if (rootAction) {
        await executeActionFCType(rootAction);
      }
    },
    [setMultipleActions, executeActionFCType]
  );

  const createActionHandler = useCallback(
    (actionName: string) =>
      async (triggerType: TTriggerValue = DEFAULT_TRIGGER): Promise<void> => {
        const actionMap = actionsMap[actionName];
        if (!actionMap) {
          console.warn(`No actions found for: ${actionName}`);
          return;
        }

        triggerNameRef.current = triggerType;
        await executeTriggerActions(actionMap, triggerType);
      },
    [actionsMap, executeTriggerActions]
  );

  const actions = useMemo(() => {
    const validActions = dataProps?.filter((item) => !_.isEmpty(item.data));
    const result: Record<string, React.MouseEventHandler<HTMLButtonElement>> = {};
    if (!_.isArray(validActions)) return {};
    for (const item of validActions) {
      result[item.name] = async (e) => {
        e?.preventDefault?.();
        const handler = createActionHandler(item.name);
        await handler();
      };
    }

    return result;
  }, [dataProps, createActionHandler]);

  useEffect(() => {
    const currentActionsMap = actionsMap[triggerNameRef.current];
    const previousActionsMap = previousActionsMapRef.current[triggerNameRef.current];

    if (currentActionsMap && !_.isEqual(currentActionsMap, previousActionsMap)) {
      setMultipleActions({
        actions: currentActionsMap,
        triggerName: triggerNameRef.current,
      });

      previousActionsMapRef.current[triggerNameRef.current] = currentActionsMap;
    }
  }, [actionsMap, setMultipleActions]);

  return { actions };
};
