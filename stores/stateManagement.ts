import { create } from 'zustand';
import { devtools } from 'zustand/middleware'; // Import devtools middleware

import {
  TDocumentState,
  TDocumentStateFind,
  TDocumentStateSet,
  TDocumentStateUpdate,
  TVariable,
} from '@/types';

export type TDocumentStateActions = {
  setDataTypeDocumentVariable: (variable: TDocumentStateSet) => void;
  setDocumentVariable: (data: TDocumentState) => void;
  findVariable: (data: TDocumentStateFind) => TVariable | undefined;
  updateDocumentVariable: (data: TDocumentStateUpdate) => TVariable[];
  resetState: () => void;
};

const initValue: TDocumentState = {
  componentState: [],
  appState: [],
  globalState: [],
};

// Sử dụng devtools middleware
export const stateManagementStore = create<TDocumentState & TDocumentStateActions>()(
  devtools(
    (set, get) => ({
      ...initValue,
      setDocumentVariable: (data) => {
        set(() => data);
      },
      setDataTypeDocumentVariable: ({ type, dataUpdate }) => {
        set(() => ({
          [type]: dataUpdate,
        }));
      },
      findVariable: ({ type, name }) => {
        const data = get()[type];
        const existed = data?.find((item) => item.key === name);
        return existed;
      },
      updateDocumentVariable: ({ type, dataUpdate }) => {
        set((state) => {
          // Reuse findVariable to check if the item exists
          const existingItem = state.findVariable({
            type,
            name: dataUpdate?.key ?? '',
          });
          const currentItems: TVariable[] = state[type]!;

          if (!existingItem) {
            return { [type]: [...currentItems, dataUpdate] };
          } else {
            return {
              [type]: currentItems.map((item) => (item.key === dataUpdate.key ? dataUpdate : item)),
            };
          }
        });
        return get()[type];
      },

      resetState() {
        set(initValue);
      },
    }),
    {
      name: 'stateManagementStore', // Tên của store trong Redux DevTools
    }
  )
);
