import { TTypeSelectState } from './stateManagement';

export type TActionSelect = 'navigate' | 'apiCall' | 'updateStateManagement';
export type TActionFCType = 'normal' | 'condition' | 'loop';
export type TActionVariable = {
  key: string;
  value: string;
  store: TTypeSelectState;
};
export type TActionApiCall = {
  apiId: string;
  apiName: string;
  variables: TActionVariable[];
  output: {
    variableName: string;
    jsonPath?: string;
  };
};

export type TActionUpdateStateVariable = {
  key: string;
  value: string;
  keyStore: TTypeSelectState;
  valueStore: TTypeSelectState;
};
export type TActionUpdateState = {
  update: TActionUpdateStateVariable[];
};
export type TActionNavigate = {
  url: string;
};
export type TActionsStateManagement = {
  id: string;
  variable: string;
  valueChange: any;
};
export type TActions<T = TActionNavigate> = {
  id: string;
  componentId?: string;
  name: string;
  type?: TActionSelect;
  fcType?: TActionFCType;
  action?: TActions;
  data?: T;
};
