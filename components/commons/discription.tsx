import _ from "lodash";
import { CSSProperties } from "react";

interface DiscriptionCompoProps {
  data?: any;
  style?: CSSProperties;
}

const DiscriptionCompo = ({ data, style }: DiscriptionCompoProps) => {
  const title = _.get(data, "title", "Discription");

  const newStyle: CSSProperties = {
    lineHeight: "170%",
    ...style,
    padding: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingTop: 0,
  };

  return (
    <p style={newStyle} className="description text-pretty">
      {title}
    </p>
  );
};

export default DiscriptionCompo;
