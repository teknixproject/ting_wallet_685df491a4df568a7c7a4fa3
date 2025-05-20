export type TSourceValue =
  | 'combineText'
  | 'appState'
  | 'globalState'
  | 'apiCalls'
  | 'dynamicGenerate'
  | 'apiResponse'
  | 'conditions';
export type TTypeSelect =
  | 'appState'
  | 'componentState'
  | 'globalState'
  | 'apiResponse'
  | 'dynamicGenerate';
export type TActionSelect =
  | 'navigate'
  | 'apiCall'
  | 'updateStateManagement'
  | 'conditionalChild'
  | 'conditional';
export type TActionFCType = 'action' | 'conditional' | 'conditionalChild' | 'loop';
export type TStatusResponse = 'success' | 'error';
export type TOperatorCompare =
  | 'equal'
  | 'notEqual'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual';
export type TTriggerValue = 'onPageLoad' | 'onClick' | 'onEnter' | 'onMouseDown';
export const OPERATORS: {
  name: string;
  value: TOperatorCompare;
  char: string;
}[] = [
  {
    name: 'Equal',
    value: 'equal',
    char: '=',
  },
  {
    name: 'Not Equal',
    value: 'notEqual',
    char: '!',
  },
  {
    name: 'Greater Than',
    value: 'greaterThan',
    char: '>',
  },
  {
    name: 'Less Than',
    value: 'lessThan',
    char: '<',
  },
  {
    name: 'Greater Than or Equal',
    value: 'greaterThanOrEqual',
    char: '>=',
  },
  {
    name: 'Less Than or Equal',
    value: 'lessThanOrEqual',
    char: '<=',
  },
];
export type TTriggerActionValue = {
  [key: string]: TAction;
};

export type TActionVariable = {
  firstValue: {
    variableId: string;
    typeStore: TTypeSelect;
  };
  secondValue: {
    variableId: string;
    typeStore: TTypeSelect;
    value: string;
  };
};

// API call action configuration
export type TActionApiCall = {
  apiId: string;
  apiName: string;
  variables: TActionVariable[];
  output: {
    variableId: string;
    jsonPath?: string;
  };
  status: TStatusResponse;
};

export type TActionUpdateStateVariable = {
  firstState: {
    typeStore: TTypeSelect;
    variableId: string;
  };
  secondState: {
    typeStore: TTypeSelect;
    variableId: string;
    value: string;
  };
};

export type TActionUpdateState = {
  update: TActionUpdateStateVariable[];
};

export type TActionNavigate = {
  isExternal: boolean;
  isNewTab: boolean;
  url: string;
};

export type TConditional = {
  label: string;
  isMultiple?: boolean;
  conditions?: string[]; //action ids
};

export type TConditionCompareValue = {
  firstValue: {
    variableId: string;
    typeStore: TTypeSelect;
    value: string;
    returnValue: string;
  };
  operator: TOperatorCompare;
  secondValue: {
    variableId: string;
    typeStore: TTypeSelect;
    value: string;
    returnValue: string;
  };
};

export type TConditionalChild = {
  id: string;
  parentId: string | null;
  label: string;
  name: string;
  conditionField: 'firstValue' | 'secondValue';
  type: 'compare' | 'logic';
  logicOperator: 'and' | 'or';
  fistCondition: string;
  secondCondition: string;
  compare: TConditionCompareValue;
};
export type TConditionChildCompareValue = {
  firstValue: {
    variable: string;
    typeStore: TTypeSelect;
  };
  operator: TOperatorCompare;
  secondValue: {
    typeStore: TTypeSelect;
    variable: string;
    value: string;
  };
};
export type TConditionChildMap = {
  label: 'if' | 'else' | 'elseIf';
  childs: { [key: string]: TConditionalChild };
};

export type TAction<T = unknown> = {
  id: string;
  parentId: string | null;
  next?: string;
  name: string;
  fcType?: TActionFCType;
  type?: TActionSelect | undefined | null;
  success?: string;
  error?: string;
  data?: T;
};

export type TTriggerActions = {
  [key in TTriggerValue]?: {
    [key: string]: TAction;
  };
};

export type TActionStateManagement = {
  id: string;
  variable: string;
  valueChange: unknown;
};
