'use client';

import { CSSProperties, useMemo } from 'react';

import { GridItem } from '@/types/gridItem';
import _ from 'lodash';

interface BackgroundCompoProps {
  data?: GridItem;
  style?: CSSProperties;
}

const BackgroundCompo = ({ data, style }: BackgroundCompoProps) => {
  const defaultUrl = '/default-bg.png';
  const url = data?.dataSlice.url || defaultUrl;

  const computedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      inset: 0,
      objectFit: _.get(style, 'objectFit') || 'fill',
      height: '100%',
    }),
    [style]
  );

  return (
    <div id="background-compo" style={computedStyle}>
      {url ? (
        url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) ? (
          <img style={computedStyle} src={url} alt="Preview" className="w-full" />
        ) : url.match(/\.(mp4|mov|avi|mkv|webm)$/i) ? (
          <video
            style={computedStyle}
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-video"
            src={url}
            preload="metadata"
          >
            <source src={`${url}.webm`} type="video/webm" />
            <source src={url} type="video/mp4" />
          </video>
        ) : (
          <p>Unsupported media type</p>
        )
      ) : null}
    </div>
  );
};

export default BackgroundCompo;
