export const getComponentType = (value: string) => {
  const valueType = value.toLowerCase();
  const isForm = ['form'].includes(valueType);
  const isNoChildren = ['list', 'collapse'].includes(valueType);
  const isChart = valueType.includes('chart');
  const isInput = ['inputtext', 'inputnumber', 'textarea', 'radio', 'select', 'checkbox'].includes(
    valueType
  );
  return {
    isForm,
    isNoChildren,
    isChart,
    isInput,
  };
};
