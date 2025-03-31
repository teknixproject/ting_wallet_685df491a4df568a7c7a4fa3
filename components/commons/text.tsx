import _ from 'lodash';
import { CSSProperties, useMemo } from 'react';

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
  const newStyle: CSSProperties = {
    ...style,
  };

  const tooltip = useMemo(() => {
    return data.tooltip;
  }, [data]);

  const content = (
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

export default Text;
