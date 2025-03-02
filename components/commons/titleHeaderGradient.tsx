import { getDeviceType } from "@/lib/utils";
import _ from "lodash";
import { CSSProperties } from "react";

const TitleHeaderGradient = ({
  data,
  style,
}: {
  data?: any;
  style?: CSSProperties;
}) => {
  const deviceType = getDeviceType();
  const isMobile = deviceType === "mobile";

  const text = _.get(data, "title", "Title Header Gradient");

  const newStyle = {
    letterSpacing: isMobile ? "0.1px" : "",
    lineHeight: "170%",
    ...style,
  };

  return (
    <h2
      style={newStyle}
      className="heading-1 flex items-center gap-3 text-title-gradient max-lg:inline"
    >
      {text}
    </h2>
  );
};

export default TitleHeaderGradient;
