import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { TApiCallValue } from '@/types';

export type TApiResourceValue = {
  apis: TApiCallValue[];
};
export type TApiCallResource = {
  apiResources: Record<string, TApiCallValue>;
};
type TApiStoreActions = {
  addAndUpdateApiResource: (data: TApiResourceValue) => void;
  findApiResourceValue: (apiId: string) => TApiCallValue | undefined;
};

const defaultApiResource: TApiCallResource = {
  apiResources: {},
};
type TApiCallStore = TApiCallResource & TApiStoreActions;
export const apiResourceStore = create<TApiCallStore>()(
  devtools(
    (set, get) => ({
      ...defaultApiResource,
      addAndUpdateApiResource: ({ apis }: TApiResourceValue) =>
        set((state) => {
          return {
            apiResources: {
              ...state.apiResources,
              ...apis?.reduce((arr, item) => {
                return { ...arr, [item?.apiId as string]: item };
              }, {}),
            },
          } as TApiCallResource;
        }),

      findApiResourceValue(apiId) {
        const apiResource = get().apiResources[apiId];
        return apiResource;
      },
    }),
    {
      name: 'apiCallStorePP', // Tên của store trong Redux DevTools
    }
  )
);
