import _ from 'lodash';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { TAuthSetting } from '@/types/authSetting';

type TState = TAuthSetting;

type TActions = {
  reset: (data?: TState) => void;
};

const initValue: TState = {
  enable: false,
  entryPage: '',
  loginPage: '',
  pages: [],
  projectId: '',
  refreshAction: undefined,
};

export const authSettingStore = create<TState & TActions>()(
  devtools(
    (set) => ({
      ...initValue,

      reset: (data) => {
        set(_.isEmpty(data) ? initValue : data);
      },
    }),
    {
      name: 'authSettingStore',
    }
  )
);
