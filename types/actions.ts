export type TTypeSelect = 'appState' | 'componentState' | 'globalState';
// Core action types
export type TActionSelect = 'navigate' | 'apiCall' | 'updateStateManagement';
export type TActionFCType = 'action' | 'conditional' | 'loop';
export type TStatusResposne = 'success' | 'error';
export type TOperatorCompare =
  | 'equal'
  | 'notEqual'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual';
export type TTriggerValue = 'onPageLoad' | 'onClick' | 'onEnter' | 'onMouseDown';

export type TTriggerActionValue = {
  [key: string]: TAction;
};

// Action variable for API calls
export type TActionVariable = {
  key: string;
  value: string;
  store: TTypeSelect;
};

// API call action configuration
export type TActionApiCall = {
  apiId: string;
  apiName: string;
  variables: TActionVariable[];
  output: {
    variableName: string;
    jsonPath?: string;
  };
  status: TStatusResposne;
};

// State update variable configuration
export type TActionUpdateStateVariable = {
  key: string;
  value: string;
  keyStore: TTypeSelect;
  valueStore: TTypeSelect;
};

// State update action
export type TActionUpdateState = {
  update: TActionUpdateStateVariable[];
};

// Navigation action
export type TActionNavigate = {
  url: string;
};

export type TConditional = {
  isMultiple?: boolean;
  conditions?: string[];
  true?: TAction<TConditionalChild>;
  false?: TAction<TConditionalChild>;
};
export type TConditionalChild = {
  firstValue: string;
  secondValue: string;
  operator: TOperatorCompare;
};
// Base action type with recursive structure
export type TAction<T = unknown> = {
  id: string;
  parentId: string | null;
  next?: string; //id of Next handler
  name: string;
  fcType?: TActionFCType;
  type?: TActionSelect | undefined | null;
  success?: string; // Success handler
  error?: string; // Error handler
  data?: T; // Generic data for action-specific payload
};

// Trigger-to-action mapping
export type TTriggerActions = {
  [key in TTriggerValue]?: {
    [key: string]: TAction;
  }; // Optional actions per trigger
};

// State management action (optional, if needed)
export type TActionStateManagement = {
  id: string;
  variable: string;
  valueChange: unknown;
};
