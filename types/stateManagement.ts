import { TTypeVariable } from './variable';

export type TTypeSelectState = 'appState' | 'componentState' | 'globalState';
export type TVariable = {
  key: string;
  type: TTypeVariable;
  isList: boolean;
  value: string;
};
export type TPageVariable = {
  projectId: string;
  documentId?: string;
  uid?: string;
  state: TVariable[];
  type: TTypeSelectState;
};
export type TPageVariableResponse = {
  message: string;
  data: TPageVariable;
};

export type TTypeDocumentState = TTypeSelectState;
export type TDocumentState = {
  appState?: TVariable[];
  componentState?: TVariable[];
  globalState?: TVariable[];
};
export type TDocumentStateSet = {
  type: TTypeDocumentState;
  dataUpdate: TVariable[];
};
export type TDocumentStateUpdate = {
  type: TTypeDocumentState;
  dataUpdate: Partial<TVariable>;
};
export type TDocumentStateFind = {
  type: TTypeDocumentState;
  name: string;
};
