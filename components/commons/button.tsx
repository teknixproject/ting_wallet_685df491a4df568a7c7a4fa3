"use client";

import _ from "lodash";
import Link from "next/link";
import { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

interface StylesProps {
  style?: {
    hover?: CSSProperties;
    [key: string]: any;
  };
}

interface ButtonCompoProps {
  data?: any;
  style?: CSSProperties;
}

const Button = ({ data, style }: ButtonCompoProps) => {
  const title = _.get(data, "title", "Discription");
  const iconStart = _.get(data, "iconStart", null);
  const iconEnd = _.get(data, "iconEnd", null);
  const link = _.get(data, "link", "");
  const route = _.get(data, "route", "");
  const router = useRouter();

  const isButtonGradient = _.get(data, "isBtnGradient", false);

  const handleRouteClick = () => {
    if (route) {
      router.push(route);
    }
  };

  if (isButtonGradient) {
    return (
      <button
        type="button"
        className="transition group flex items-center justify-center rounded-full bg-gradient-to-r from-[#1ECC97] to-[#5A60FC] p-[1.5px] text-[#1ECC97] duration-300 hover:shadow-2xl hover:shadow-purple-600/30"
      >
        <div className="px-[24px] py-[14px] max-sm:px-[16px] max-sm:py-[16px] text-[#1ECC97] flex h-full w-full items-center justify-center rounded-full bg-white transition duration-300 ease-in-out group-hover:bg-gradient-to-br group-hover:from-gray-700 group-hover:to-gray-900">
          Get Now
        </div>
      </button>
    );
  }

  return link ? (
    <Link href={link} passHref>
      <a
        style={style}
        className="!text-16-500 rounded-full flex items-center gap-2 text-center"
      >
        {iconStart && <span className="icon-start">{iconStart}</span>}
        <span>{title}</span>
        {iconEnd && <span className="icon-end">{iconEnd}</span>}
      </a>
    </Link>
  ) : (
    <CsButton
      type="button"
      style={style}
      onClick={route ? handleRouteClick : undefined}
    >
      {iconStart && <span className="icon-start">{iconStart}</span>}
      <span>{title}</span>
      {iconEnd && <span className="icon-end">{iconEnd}</span>}
    </CsButton>
  );
};

const flexCenter = {
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
};

const CsButton = styled.button<StylesProps>`
  ${(props) =>
    _.get(props, "style.after")
      ? Object.entries(flexCenter)
          .map(([key, value]) => `${key}: ${value};`)
          .join("\n")
      : ""}

  &:hover {
    ${(props) =>
      props.style?.hover
        ? Object.entries(props.style.hover)
            .map(([key, value]) => `${key}: ${value} !important;`)
            .join("\n")
        : ""}
  }

  &::before {
    ${(props) =>
      props.style?.before
        ? Object.entries(props.style.before)
            .map(([key, value]) => `${key}: ${value};`)
            .join("\n")
        : ""}
  }

  &::after {
    ${(props) =>
      props.style?.after
        ? Object.entries(props.style.after)
            .map(([key, value]) => `${key}: ${value};`)
            .join("\n")
        : ""}
  }
`;

export default Button;
