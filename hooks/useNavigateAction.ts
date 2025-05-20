import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { TAction, TActionNavigate, TTriggerActions, TTriggerValue } from '@/types';

export type TUseActions = {
  handleNavigateAction: (action: TAction<TActionNavigate>) => Promise<void>;
};

type TProps = {
  actions: TTriggerActions;
  triggerName: TTriggerValue;
  executeActionFCType: (action?: TAction) => Promise<void>;
};
export const useNavigateAction = ({
  actions,
  triggerName,
  executeActionFCType,
}: TProps): TUseActions => {
  const pathname = usePathname();
  console.log('🚀 ~ useNavigateAction ~ pathname:', pathname);
  const router = useRouter();

  // Memoized actions from data

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);
  const getActionById = (id: string): TAction | undefined => {
    return actions[triggerName]?.[id];
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

  return { handleNavigateAction };
};
