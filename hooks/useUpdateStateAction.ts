import _ from 'lodash';
import { useEffect, useRef } from 'react';

import { stateManagementStore } from '@/stores';
import { TAction, TActionUpdateState, TTriggerActions, TTriggerValue } from '@/types';

export type TUseActions = {
  handleUpdateStateAction: (action: TAction<TActionUpdateState>) => Promise<void>;
};

type TProps = {
  actions: TTriggerActions;
  triggerName: TTriggerValue;
  executeActionFCType: (action?: TAction) => Promise<void>;
};
export const useUpdateStateAction = ({
  actions,
  triggerName,
  executeActionFCType,
}: TProps): TUseActions => {
  // State management

  // Store hooks
  const { findVariable, updateVariables } = stateManagementStore();

  // Memoized actions from data

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  //#region Action Handlers
  const getActionById = (id: string): TAction | undefined => {
    return actions[triggerName]?.[id];
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

  return { handleUpdateStateAction };
};
