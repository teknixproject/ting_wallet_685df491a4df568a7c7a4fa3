import { create } from 'zustand';

export type TApiData = {
  id: string;
  data: any;
};
type TStore = {
  apiData: TApiData[];
};
type TActions = {
  addApiData: (data: TApiData) => void;
  removeApiData: (id: string) => void;
};
export const apiCallStore = create<TStore & TActions>((set) => ({
  apiData: [],
  addApiData: (data: TApiData) => set((state) => ({ apiData: [...state.apiData, data] })),
  removeApiData: (id: string) =>
    set((state) => ({ apiData: state.apiData.filter((item) => item.id !== id) })),
}));
