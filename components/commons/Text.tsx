import _ from 'lodash';
import { CSSProperties, useMemo } from 'react';
import styled, { css } from 'styled-components';

import { useData } from '@/hooks';
import { GridItem } from '@/types/gridItem';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { convertStyle } from '@/lib/utils';

interface TextProps {
  data: GridItem;
  style?: CSSProperties;
}

const Text = ({ data, style }: TextProps) => {
  const { title } = useData({ layoutData: data });
  const titles = _.get(data, 'dataSlice.titles', {});

  const newStyle: CSSProperties = {
    ...style,
  };

  const tooltip = useMemo(() => {
    return data.tooltip;
  }, [data]);

  const content = !_.isEmpty(titles) ? (
    <TextComplex data={titles} style={style} />
  ) : (
    <div style={convertStyle(newStyle)} className="text-[#858585]">
      {_.isObject(title) ? JSON.stringify(title) : title}
    </div>
  );

  if (_.isEmpty(tooltip?.title)) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent style={tooltip?.style}>
          <p>{tooltip?.title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TextComplex = ({ data, style }: { data: any; style: any }) => {
  return (
    <Container
      style={{
        display: 'inline',
        ...style,
      }}
      styledComponentCss={data?.styledComponentCss}
    >
      {Object.keys(data).map((key) => {
        const isSpecial = data[key]?.isSpecial;

        return isSpecial ? (
          <CsStrong
            key={key}
            style={{
              color: data[key].color,
              flexShrink: 0,
              fontWeight: 'normal',
              ...style,
            }}
            gradient={data[key].gradient}
          >
            {data[key]?.text || ''}
          </CsStrong>
        ) : (
          data[key]?.text
        );
      })}
    </Container>
  );
};

const CsStrong = styled.strong<{ gradient?: string }>`
  ${(props) =>
    props.gradient
      ? `
      background: linear-gradient(${props.gradient});
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    `
      : ''}
`;

interface StylesProps {
  style?: {
    hover?: CSSProperties;
    [key: string]: any;
  };
  styledComponentCss?: string;
}

const Container = styled.div<StylesProps>`
  ${(props) =>
    props.styledComponentCss
      ? css`
          ${props.styledComponentCss}
        `
      : ''}
`;

export default Text;
