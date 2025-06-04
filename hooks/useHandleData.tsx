import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';
import { useRef } from 'react';

import { stateManagementStore } from '@/stores';
import { TConditionalChild, TConditionChildMap, TTypeSelect } from '@/types';
import { TData, TDataField, TOptionApiResponse } from '@/types/dataItem';

type UseHandleDataReturn = {
  getData: (data: TData) => any;
};
const getRootConditionChild = (condition: TConditionChildMap): TConditionalChild | undefined => {
  return Object.values(condition.childs || {}).find((child) => !child.parentId);
};
const getConditionChild = (conditionId: string, condition: TConditionChildMap) => {
  return condition.childs[conditionId];
};
//#region main
export const useHandleData = (): UseHandleDataReturn => {
  const itemInList = useRef(null);
  const findVariable = stateManagementStore((state) => state.findVariable);
  const handleInputValue = (data: TData['valueInput']) => {
    return data || '';
  };
  const handleApiResponse = (data: TData) => {
    const apiResponse = data.apiResponse;
    const variableId = apiResponse?.variableId || '';
    const variable = findVariable({ id: variableId, type: 'apiResponse' });

    const handleOption = (
      item: NonNullable<TDataField<TOptionApiResponse>['options']>[number],
      value?: any
    ) => {
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
      }
    };

    let value = variable?.value;
    for (const option in apiResponse?.options) {
      value = handleOption(
        option as NonNullable<TDataField<TOptionApiResponse>['options']>[number],
        value
      );
    }
    if (_.isEmpty(variable)) return data.defaultValue;
    return value;
  };

  //#region condition
  const getConditionValue = (conditionMap: TConditionChildMap) => {
    const conditionRoot = getRootConditionChild(conditionMap);
    if (_.isEmpty(conditionRoot)) return false;
    const isConditionMet = handleCompareCondition(conditionRoot?.id as string, conditionMap);
    return isConditionMet;
  };
  const handleCompareCondition = (
    conditionChildId: string,
    condition: TConditionChildMap
  ): boolean => {
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
  };
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
  const getCompareValue = (compare: TConditionalChild['compare']): boolean => {
    const firstCompare = getData(compare?.firstValue);

    const secondCompare = getData(compare?.secondValue);
    if (!firstCompare || !secondCompare) return false;

    const resultCompare = evaluateCondition(firstCompare, secondCompare, compare.operator);

    return resultCompare;
  };
  //#region handleState
  const handleState = (data: TData) => {
    const state = data[data.type] as TDataField;
    if ('variableId' in state || {}) {
      const variableId = state?.variableId || '';
      const variable = findVariable({ id: variableId, type: data.type as TTypeSelect });

      let value = variable?.value;

      for (const option of state?.options) {
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
          case 'isEmpty':
            return _.isEmpty(value);
          case 'isNotEmpty':
            return !_.isEmpty(value);
        }
      }

      return value;
    }
  };

  //#region  handleItemInList
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
  const getData = (data: TData): any => {
    switch (data?.type) {
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
        break;
      case 'itemInList':
        return handleItemInList(data);
    }
  };

  return {
    getData,
  };
};
