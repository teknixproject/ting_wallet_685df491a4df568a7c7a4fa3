"use client";

import _ from "lodash";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { componentRegistry } from "@/lib/slices";
import { CONFIGS } from "@/configs";

import { getDeviceSize } from "@/lib/utils";
import { rebuilComponentMonaco } from "@/app/actions/use-constructor";

import LoadingPage from "./loadingPage";
import { GridSystemProps, RenderGripProps, RenderSliceProps } from "./types";
import {
  GapGrid,
  GridItem,
  GridRow,
  mapAlineItem,
  mapJustifyContent,
  SpanCol,
  SpanRow,
} from "./const";
import NotFound from "./404";

const RenderSlice = ({ slice }: RenderSliceProps) => {
  if (!slice) return null;

  const styleDevice: string = getDeviceSize() as string;

  const key = slice?.id?.split("$")[0];
  const SliceComponent =
    componentRegistry[key as keyof typeof componentRegistry];

  if (!SliceComponent && !slice?.childs) return null;

  const isGrid = slice?.type === "grid" ? "grid" : "";
  const isFlexBox = slice?.type === "flex";
  const isButton = key === "button";

  const styleSlice =
    (_.get(slice, [styleDevice]) as React.CSSProperties) || slice?.style;

  const sliceClasses = [
    slice?.colspan ? SpanCol(Number(slice.colspan)) : "",
    slice?.rowspan ? SpanRow(Number(slice.rowspan)) : "",
    slice?.rows ? GridRow(Number(slice.rows)) : "",
    slice?.gap ? GapGrid(Number(slice.gap)) : "",
    isGrid,
    isFlexBox && mapJustifyContent(slice?.justifyContent),
    isFlexBox && mapAlineItem(slice?.alignItems),
    isFlexBox && "flex",
  ]
    .filter(Boolean)
    .join(" ");

  const inlineStyles: React.CSSProperties = {
    ...(styleSlice || {}),
    gridTemplateColumns: isGrid ? `repeat(${slice?.columns}, 1fr)` : "",
  };

  const content = SliceComponent ? (
    <SliceComponent style={styleSlice} data={_.get(slice, "dataSlice")} />
  ) : (
    slice?.childs && <RenderGrid items={slice.childs} />
  );

  return sliceClasses || Object.keys(inlineStyles).length ? (
    <div className={`${sliceClasses}`} style={isButton ? {} : inlineStyles}>
      {content}
    </div>
  ) : null;
};

const RenderGrid = ({ items }: RenderGripProps) => {
  return (
    <>
      {_.map(items, (i, index) => (
        <RenderSlice key={index} slice={i} dataSlice={{}} />
      ))}
    </>
  );
};

const GridSystemContainer = ({ page, deviceType }: GridSystemProps) => {
  const [layout, setLayout] = useState<GridItem | null>(null);
  const config = layout || page;
  const [refreshKey, setRefreshKey] = useState(0);
  const previousComponentRef = useRef(null);

  const MonacoContainerRoot = useMemo(() => {
    return dynamic(() => import("@/components/grid-systems/monacoContainer"), {
      ssr: false,
      loading: () => <LoadingPage />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]); // ✅

  const content = (
    <div className="mx-auto flex justify-center">
      {config?.childs ? (
        <div className="w-full flex flex-col justify-center">
          <RenderGrid items={config.childs} />
        </div>
      ) : (
        <NotFound />
      )}
    </div>
  );

  useEffect(() => {
    const socket = io(CONFIGS.SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socket.on("connected", () => console.log("connected"));
    socket.on("return-json", async (data) => {
      if (data?.component && data.component !== previousComponentRef.current) {
        previousComponentRef.current = data.component;
        setRefreshKey((prev) => prev + 1);
        await rebuilComponentMonaco(data.component);
      }
      if (data?.layout) {
        setTimeout(() => setLayout(data.layout[deviceType]), 0);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [deviceType]);

  if (!MonacoContainerRoot || typeof MonacoContainerRoot !== "function") {
    return <>{content}</>;
  }

  return (
    <div className="overflow-hidden">
      <MonacoContainerRoot key={refreshKey}>{content}</MonacoContainerRoot>
    </div>
  );
};

export default GridSystemContainer;
