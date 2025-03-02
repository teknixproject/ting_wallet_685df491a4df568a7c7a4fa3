"use client";

import { getDeviceType } from "@/lib/utils";
import { CSSProperties, useMemo } from "react";

interface BackgroundCompoProps {
  data?: { url?: string };
  style?: CSSProperties;
}

const BackgroundCompo = ({ data, style }: BackgroundCompoProps) => {
  const defaultUrl =
    "https://www.10wallpaper.com/wallpaper/1680x1050/1609/Apple_iOS_9_iPhone_6s_Plus_HD_Wallpaper_04_1680x1050.jpg";
  const url = data?.url || defaultUrl;

  const sizeScreen = getDeviceType();
  const isMobile = sizeScreen === "mobile";

  const computedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      inset: 0,
      objectFit: "cover",
      height: isMobile ? "100%" : "auto",
    }),
    [style, isMobile]
  );

  return (
    <div id="background-compo">
      {url ? (
        url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) ? (
          <img
            style={computedStyle}
            src={url}
            alt="Preview"
            className="w-full"
          />
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
