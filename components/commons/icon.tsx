import _ from "lodash";
import { CSSProperties } from "react";
interface IconCompoProps {
  data?: any;
  style?: CSSProperties;
}

const IconCompo = ({ data }: IconCompoProps) => {
  const url = _.get(
    data,
    "url",
    "https://www.10wallpaper.com/wallpaper/1680x1050/1609/Apple_iOS_9_iPhone_6s_Plus_HD_Wallpaper_04_1680x1050.jpg"
  );

  return <img src={url} alt="Image" className="w-full h-full" />;
};

export default IconCompo;
