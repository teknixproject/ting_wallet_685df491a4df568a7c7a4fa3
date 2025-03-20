import _ from 'lodash';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { TApiCallValue } from '@/types';

export type TApiResourceValue = {
  uid: string;
  apis: TApiCallValue[];
};
export type TApiCallResource = {
  apiResources: TApiResourceValue[];
};
type TApiStoreActions = {
  addAndUpdateApiResource: (data: TApiResourceValue) => void;
  findApiResource: (uid: string) => TApiResourceValue | undefined;
  findApiResourceValue: (uid: string, apiId: string) => TApiCallValue | undefined;
};

const defaultApiResource = {
  apiResources: [],
};
type TApiCallStore = TApiCallResource & TApiStoreActions;
export const apiResourceStore = create<TApiCallStore>()(
  devtools((set, get) => ({
    ...defaultApiResource,
    addAndUpdateApiResource: (data: TApiResourceValue) =>
      set((state) => {
        const existed = get().findApiResource(data.uid);
        if (_.isEmpty(existed)) {
          return {
            apiResources: [...state.apiResources, data],
          };
        }
        return {
          apiResources: state.apiResources?.map((item) => (item.uid === data.uid ? data : item)),
        };
      }),
    findApiResource(uid) {
      const apiResource = get().apiResources?.find((item) => item.uid === uid);
      return apiResource;
    },
    findApiResourceValue(uid, apiId) {
      const apiResource = get().apiResources.find((item) => item.uid === uid);
      if (_.isEmpty(apiResource)) return undefined;
      return apiResource?.apis?.find((item) => item.apiId === apiId);
    },
  }))
);
