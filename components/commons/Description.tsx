import _ from 'lodash';
import { CSSProperties } from 'react';

import { useHandleData } from '@/hooks/useHandleData';

interface DescriptionProps {
  data?: any;
  style?: CSSProperties;
}

const Description = ({ data, style }: DescriptionProps) => {
  const { dataState } = useHandleData({ dataProp: data?.data });
  const title = _.get(data, 'dataSlice.title') || dataState;
  const newStyle: CSSProperties = {
    lineHeight: '170%',
    ...style,
    padding: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingTop: 0,
  };

  return (
    <p style={newStyle} className="description text-pretty">
      {title}
    </p>
  );
};

export default Description;
