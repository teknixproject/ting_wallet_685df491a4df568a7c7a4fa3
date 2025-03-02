"use client";

import { getDeviceType } from "@/lib/utils";
import _ from "lodash";
import { CSSProperties, useEffect, useState } from "react";

interface BannerVideoCompoProps {
  data?: any;
  style?: CSSProperties;
}

const BannerVideo = ({ data, style }: BannerVideoCompoProps) => {
  const linkVideo = _.get(data, "url", "/assets/videos/intro.mov");
  const [isInView, setIsInView] = useState(false);
  const sizeScreen = getDeviceType();
  const isMobile = sizeScreen === "mobile";

  const newStyle: CSSProperties | undefined = {
    ...style,
    inset: 0,
    objectFit: "fill",
    height: isMobile ? "100%" : "auto",
  };

  useEffect(() => {
    const handleScroll = () => {
      const rect = document
        .getElementById("banner-video")
        ?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        setIsInView(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div id="banner-video">
      {isInView ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full aspect-video"
          style={newStyle}
          preload="metadata"
        >
          <source src={`${linkVideo}.webm`} type="video/webm" />
          <source src={linkVideo} type="video/mp4" />
        </video>
      ) : (
        <video
          style={newStyle}
          autoPlay
          loop
          muted
          playsInline
          className="w-full aspect-video max-sm:h-full"
          src={linkVideo}
          preload="metadata"
        >
          <source src={`${linkVideo}.webm`} type="video/webm" />
          <source src={linkVideo} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

export default BannerVideo;
