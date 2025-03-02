import _ from "lodash";
import Link from "next/link";
import React, { CSSProperties } from "react";

interface LinkCompoProps {
  data?: any;
  style?: CSSProperties;
}

const LinkCompo = ({ data, style }: LinkCompoProps) => {
  const title = _.get(data, "title", "LinkCompo");
  const link = _.get(data, "link", "LinkCompo");

  const newStyle: CSSProperties = {
    ...style,
    wordBreak: "break-word",
    textDecoration: "underline",
    fontStyle: "italic",
  };

  return (
    <Link
      style={newStyle}
      href={link}
      className="w-full flex flex-wrap"
      prefetch={true}
    >
      {title}
    </Link>
  );
};

export default LinkCompo;
