import { getDeviceType } from "@/lib/utils";
import _ from "lodash";
import { CSSProperties } from "react";

interface TitleHeaderProps {
  data?: any;
  style?: CSSProperties;
}

const TitleHeader = ({ data, style }: TitleHeaderProps) => {
  const deviceType = getDeviceType();
  const isMobile = deviceType === "mobile";

  const title = _.get(data, "title", "Title Header");

  const newStyle = {
    letterSpacing: isMobile ? "0.1px" : "",
    lineHeight: "170%",
    ...style,
  };

  return (
    <h2
      style={newStyle}
      className="heading-1 flex items-center gap-3 max-lg:inline"
    >
      {title}
    </h2>
  );
};

export default TitleHeader;
