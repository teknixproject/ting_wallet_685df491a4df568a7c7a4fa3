export type TActionSelect = 'navigate' | 'apiCall' | 'stateManagement';
export type TActionFCType = 'normal' | 'condition' | 'loop';
export type TActionVariable = {
  key: string;
  value: string;
};
export type TActionApiCall = {
  apiId: string;
  apiName: string;
  variables: TActionVariable[];
  output: { variableName: string };
};
export type TActionsStateManagement = {
  id: string;
  variable: string;
  valueChange: any;
};
export type TActions = {
  id: string;
  componentId?: string;
  name: string;
  type?: TActionSelect;
  fcType?: TActionFCType;
  action?: TActions;
  data?: TActionApiCall;
};
//#region type of service

export type TActionServer = {
  projectId: string;
  uid: string;
  data: TActions[];
};
