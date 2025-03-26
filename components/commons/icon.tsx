import _ from 'lodash';
import { CSSProperties } from 'react';

import { GridItem } from '../grid-systems/const';

interface IconCompoProps {
  data?: GridItem;
  style?: CSSProperties;
}

const IconCompo = ({ data }: IconCompoProps) => {
  const url = _.get(data, 'dataSlice.url');

  return url ? (
    <img src={url} alt="Image" className="w-full h-auto" />
  ) : (
    <img src="/default-icon.png" alt="default-icon" />
  );
};

export default IconCompo;
