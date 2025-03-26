/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { CSSProperties } from 'react';

import { useData } from '@/hooks';

import { GridItem } from '../grid-systems/const';

interface TextProps {
  data: GridItem;
  style?: CSSProperties;
}

const Text = ({ data, style }: TextProps) => {
  const { title } = useData({ layoutData: data });
  const newStyle: CSSProperties = {
    ...style,
  };

  return (
    <div style={newStyle} className="text-[#858585]">
      {_.isObject(title) ? JSON.stringify(title) : title}
    </div>
  );
};

export default Text;
