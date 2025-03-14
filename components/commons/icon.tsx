import _ from 'lodash';
import { CSSProperties } from 'react';
interface IconCompoProps {
  data?: any;
  style?: CSSProperties;
}

const IconCompo = ({ data }: IconCompoProps) => {
  const url = _.get(data, 'url');

  return url ? (
    <img src={url} alt="Image" className="w-full h-auto" />
  ) : (
    <img src="/default-icon.png" alt="default-icon" />
  );
};

export default IconCompo;
