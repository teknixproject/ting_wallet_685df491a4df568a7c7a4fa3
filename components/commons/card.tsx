import _ from 'lodash';
import Image from 'next/image';
import React from 'react';
import { CSSProperties } from 'styled-components';

import { useData } from '@/hooks';
import { cn } from '@/lib/utils';

import { RenderSlice } from '../grid-systems';
import { GridItem } from '../grid-systems/const';

interface CardProps {
  data: GridItem;
  style?: CSSProperties;
}

const Card: React.FC<CardProps> = ({ data, style }) => {
  const childs = _.get(data, 'childs', []);
  const { title } = useData({ layoutData: data });

  const newStyle: CSSProperties = {
    lineHeight: '170%',
    ...style,
    padding: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingTop: 0,
  };

  const content = childs?.length
    ? childs.map((child) => (
        <RenderSlice slice={child} idParent={child.id ?? ''} key={child?.id ?? ''} />
      ))
    : title;

  return (
    <div className="bg-gray-950 p-5" style={newStyle}>
      <div
        className={cn(`p-[2px] size-52 bg-gray-700 rounded-md shadow-lg relative flex items-end`)}
      >
        <Image
          src="https://res.cloudinary.com/dubi5n4bw/image/upload/v1739516682/uploads/Background%2BOverlay%2BBorder%2BOverlayBlur.png"
          fill
          alt="review"
          className="absolute inset-0 z-2"
        />
        <div className="z-1 text-center text-white">{content}</div>
      </div>
    </div>
  );
};

export default Card;
