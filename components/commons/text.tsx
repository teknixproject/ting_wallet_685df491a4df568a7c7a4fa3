/* eslint-disable @typescript-eslint/no-unused-vars */
import { CSSProperties } from 'react';

import { useData } from '@/hooks';

import { GridItem } from '../grid-systems/const';

interface TextProps {
  data: GridItem;
  style?: CSSProperties;
}

const Text = ({ data, style }: TextProps) => {
  // const [title, setTitle] = useState<string>(_.get(data, 'dataSlice.title', 'Text'));
  // const [variableName, setVariableName] = useState<string>(
  //   _.get(data, 'dataSlice.variableName', '')
  // );
  // const [typeStore, setTypeStore] = useState<TTypeSelectState>(
  //   _.get(data, 'dataSlice.typeStore', 'appState')
  // );

  // const { findVariable, appState, componentState, globalState } = stateManagementStore();
  // console.log('🚀 ~ Text ~ appState:', appState);

  // const { extractAllValuesFromTemplate } = variableUtil;

  // useEffect(() => {
  //   if (variableName && typeStore) {
  //     const key = extractAllValuesFromTemplate(variableName);
  //     const valueInStore = findVariable({
  //       type: typeStore,
  //       name: key ?? '',
  //     });
  //     console.log('🚀 ~ useEffect ~ valueInStore:', valueInStore);
  //     setTitle(valueInStore?.value ?? 'Text');
  //   }
  // }, [variableName, typeStore, appState, componentState, globalState]);

  const { title } = useData(data);
  const newStyle: CSSProperties = {
    ...style,
  };

  return (
    <div style={newStyle} className="text-[#858585]">
      {JSON.stringify(title)}
    </div>
  );
};

export default Text;
