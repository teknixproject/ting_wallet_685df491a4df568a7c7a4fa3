"use client";

import { useEffect, useState } from "react";
import GridSystemContainer from "@/components/grid-systems";
import { getDeviceType } from "@/lib/utils";
import { useConstructorDataAPI } from "@/app/actions/use-constructor";
import LoadingPage from "./loadingPage";

export default function ClientWrapper(props: any) {
  const { layout, isLoading } = useConstructorDataAPI(
    props.documentId,
    props.pathName
  );

  const [deviceType, setDeviceType] = useState(getDeviceType());
  const selectedLayout = layout[deviceType] ?? layout ?? {};

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [props.page]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <GridSystemContainer
      isLoading={isLoading}
      {...props}
      page={selectedLayout || {}}
      deviceType={deviceType}
    />
  );
}
