import _ from 'lodash';
import { CSSProperties } from 'react';

interface ImageProps {
  data?: any;
  style?: CSSProperties;
}

const Image = ({ data, style }: ImageProps) => {
  const url = _.get(data, 'url', '/default-bg.png');

  const newStyle: CSSProperties = {
    ...style,
    position: 'initial',
    transform: '',
    margin: 0,
    padding: 0,
    maxHeight: '',
    maxWidth: '',
    width: '100%',
    height: '100%',
  };

  const isBg = _.get(style, 'background');

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      className="relative overflow-hidden flex items-center justify-center"
    >
      <img style={newStyle} src={url} alt="Image" className="w-full h-auto object-cover" />
      {isBg && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isBg as string,
          }}
        ></div>
      )}
    </div>
  );
};

export default Image;
