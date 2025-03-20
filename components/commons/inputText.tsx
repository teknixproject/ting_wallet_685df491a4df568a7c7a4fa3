import _ from 'lodash';
import React from 'react';
import { CSSProperties } from 'styled-components';

import { GridItem } from '../grid-systems/const';

type Props = { data: GridItem };

const InputText: React.FC<Props> = ({ data }) => {
  const title = _.get(data, 'title', 'Text');
  const style = _.get(data, 'style', {});
  const newStyle: CSSProperties = {
    ...(typeof style === 'object' && style !== null ? style : {}),
  };

  return <input type="text" defaultValue={title} style={newStyle} />;
};

export default InputText;
