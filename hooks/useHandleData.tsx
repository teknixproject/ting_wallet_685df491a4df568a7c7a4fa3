import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

import { stateManagementStore } from '@/stores';
import { TConditionalChild, TConditionChildMap, TTypeSelect } from '@/types';
import { TData, TDataField, TOptionApiResponse } from '@/types/dataItem';

type UseHandleDataReturn = {
  dataState?: any;
  getData: (data: TData) => any;
};

const getRootConditionChild = (condition: TConditionChildMap): TConditionalChild | undefined => {
  return Object.values(condition.childs || {}).find((child) => !child.parentId);
};

const getConditionChild = (conditionId: string, condition: TConditionChildMap) => {
  return condition.childs[conditionId];
};

type TUseHandleData = {
  dataProp?: TData;
};

export const useHandleData = (props: TUseHandleData): UseHandleDataReturn => {
  const { apiResponse, appState, componentState, globalState } = stateManagementStore();
  const [dataState, setDataState] = useState<any>();
  const itemInList = useRef(null);
  const findVariable = stateManagementStore((state) => state.findVariable);

  const handleInputValue = (data: TData['valueInput']) => {
    return data || '';
  };

  const handleApiResponse = useCallback(
    (data: TData) => {
      const apiResponse = data.apiResponse;
      const variableId = apiResponse?.variableId || '';
      const variable = findVariable({ id: variableId, type: 'apiResponse' });

      const handleOption = (
        item: NonNullable<TDataField<TOptionApiResponse>['options']>[number],
        value?: any
      ) => {
        console.log('🚀 ~ handleApiResponse ~ item:', item);

        switch (item.option) {
          case 'jsonPath':
            const valueJsonPath = JSONPath({
              json: value,
              path: getData(item.jsonPath as TData) || '',
            });
            return valueJsonPath[0];
          case 'statusCode':
            return value?.statusCode;
          case 'succeeded':
            return value?.succeeded;
          case 'isEmpty':
            return _.isEmpty(value);
          case 'isNotEmpty':
            return !_.isEmpty(value);
          case 'exceptionMessage':
            return value?.data?.message;
          default:
            return variable || data.defaultValue;
        }
      };

      let value = variable?.value;
      for (const option of apiResponse?.options || []) {
        value = handleOption(
          option as NonNullable<TDataField<TOptionApiResponse>['options']>[number],
          value
        );
      }
      if (_.isEmpty(variable)) return data.defaultValue;
      return value;
    },
    [findVariable]
  );

  const getConditionValue = useCallback((conditionMap: TConditionChildMap) => {
    const conditionRoot = getRootConditionChild(conditionMap);
    if (_.isEmpty(conditionRoot)) return false;
    const isConditionMet = handleCompareCondition(conditionRoot?.id as string, conditionMap);
    return isConditionMet;
  }, []);

  const handleCompareCondition = useCallback(
    (conditionChildId: string, condition: TConditionChildMap): boolean => {
      const conditionChild = getConditionChild(conditionChildId, condition);

      if (conditionChild.type === 'compare') {
        return getCompareValue(conditionChild.compare);
      }

      let firstValue;
      let secondValue;

      if (conditionChild.fistCondition) {
        firstValue = handleCompareCondition(conditionChild.fistCondition, condition);
      }

      if (conditionChild.secondCondition) {
        secondValue = handleCompareCondition(conditionChild.secondCondition, condition);
      }

      if (conditionChild.logicOperator === 'and') {
        return !!(firstValue && secondValue);
      }
      if (conditionChild.logicOperator === 'or') {
        return !!(firstValue || secondValue);
      }
      return !!(firstValue && secondValue);
    },
    []
  );

  const evaluateCondition = (firstValue: any, secondValue: any, operator: string): boolean => {
    switch (operator) {
      case 'equal':
        return String(firstValue) === String(secondValue);
      case 'notEqual':
        return String(firstValue) !== String(secondValue);
      case 'greaterThan':
        return Number(firstValue) > Number(secondValue);
      case 'lessThan':
        return Number(firstValue) < Number(secondValue);
      case 'greaterThanOrEqual':
        return Number(firstValue) >= Number(secondValue);
      case 'lessThanOrEqual':
        return Number(firstValue) <= Number(secondValue);
      default:
        return false;
    }
  };

  const getCompareValue = useCallback((compare: TConditionalChild['compare']): boolean => {
    const firstCompare = getData(compare?.firstValue);
    const secondCompare = getData(compare?.secondValue);
    if (!firstCompare || !secondCompare) return false;

    const resultCompare = evaluateCondition(firstCompare, secondCompare, compare.operator);
    return resultCompare;
  }, []);

  const handleState = useCallback(
    (data: TData) => {
      console.log('🚀 ~ handleState ~ data:', data);

      const state = data[data.type] as TDataField;
      if ('variableId' in state || {}) {
        const variableId = state?.variableId || '';
        const variable = findVariable({ id: variableId, type: data.type as TTypeSelect });

        console.log('🚀 ~ handleState ~ variable:', variable);
        let value = variable?.value;

        for (const option of state?.options || []) {
          const optionItem = option as NonNullable<TDataField['options']>[number];

          switch (optionItem.option) {
            case 'jsonPath':
              const jsonPathValue = getData(optionItem.jsonPath as TData);
              const valueJsonPath = JSONPath({
                json: value,
                path: jsonPathValue || '',
              });
              value = valueJsonPath[0];
              break;

            case 'itemAtIndex':
              const index = getData(optionItem?.itemAtIndex as TData);
              let indexValid: number = 0;
              if (typeof index !== 'number') {
                indexValid = parseInt(index);
              }
              value = value[indexValid];
              break;

            case 'filter':
              if (Array.isArray(value)) {
                value = value.filter((item: any) => {
                  itemInList.current = item;
                  const result = getConditionValue(
                    optionItem.filterCondition?.data as TConditionChildMap
                  );
                  return result;
                });
              }
              break;

            case 'sort':
              if (Array.isArray(value)) {
                const sortOption = optionItem.sortOrder || 'asc';
                const jsonPath = getData(optionItem.jsonPath as TData);

                value = [...value].sort((a: any, b: any) => {
                  let aVal = a;
                  let bVal = b;

                  if (jsonPath) {
                    const aJsonPath = JSONPath({ json: a, path: jsonPath });
                    const bJsonPath = JSONPath({ json: b, path: jsonPath });
                    aVal = aJsonPath[0];
                    bVal = bJsonPath[0];
                  }

                  if (sortOption === 'asc') {
                    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                  } else {
                    return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                  }
                });
              }
              break;

            case 'length':
              return value?.length || 0;
            case 'isEmpty':
              return _.isEmpty(value);
            case 'isNotEmpty':
              return !_.isEmpty(value);
            default:
              return value || data?.defaultValue;
          }
        }

        return value;
      }
    },
    [findVariable]
  );

  const handleItemInList = (data: TData) => {
    const { jsonPath } = data.itemInList;
    if (jsonPath) {
      const result = JSONPath({
        json: itemInList.current,
        path: jsonPath || '',
      })?.[0];
      return result;
    }
    return itemInList.current;
  };

  const getData = useCallback(
    (data: TData): any => {
      if (!data || !data.type) return data?.defaultValue;

      switch (data.type) {
        case 'valueInput':
          return handleInputValue(data.valueInput);
        case 'apiResponse':
          return handleApiResponse(data);
        case 'appState':
          return handleState(data);
        case 'componentState':
          return handleState(data);
        case 'globalState':
          return handleState(data);
        case 'combineText':
          // Add your combine text logic here
          return data.combineText;
        case 'itemInList':
          return handleItemInList(data);
        default:
          return data?.defaultValue;
      }
    },
    [handleApiResponse, handleState]
  );

  // Fixed useEffect - only update when data actually changes
  useEffect(() => {
    if (props?.dataProp) {
      const newDataState = getData(props.dataProp);
      // Only update state if the value actually changed
      setDataState((prevState: any) => {
        if (!_.isEqual(prevState, newDataState)) {
          return newDataState;
        }
        return prevState;
      });
    }
  }, [props?.dataProp, apiResponse, appState, componentState, globalState, getData]);

  return {
    getData,
    dataState,
  };
};
