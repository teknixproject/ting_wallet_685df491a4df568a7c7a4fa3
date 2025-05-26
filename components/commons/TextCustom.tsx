import _ from 'lodash';
import { CSSProperties } from 'react';

import {} from '@/hooks';
import { usePageActions } from '@/hooks/usePageActions';

interface TextProps {
  data?: any;
  style?: CSSProperties;
}

const TextCustom = ({ data, style }: TextProps) => {
  const title = _.get(data, 'title', 'Title Header');
  const { multiples } = usePageActions();
  console.log('🚀 ~ TextCustom ~ multiples:', multiples);
  const { test1, test2 } = multiples || {};
  const newStyle: CSSProperties = {
    ...style,
  };

  return (
    <div style={newStyle} className="text-[#858585]">
      <button onClick={() => test1()}>Button1</button>
      <button onClick={() => test2()}>Button2</button>
      {title}
    </div>
  );
};

export default TextCustom;
