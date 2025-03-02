import ClientWrapper from "@/components/grid-systems/ClientWrapGridSystem";
import { Fragment } from "react";

export const dynamic = "force-static";
export const revalidate = 60;
const pathName = "home";

export default async function Home() {
  const layoutId = pathName;

  return (
    <Fragment>
      <ClientWrapper layoutId={layoutId} pathName={pathName} />
    </Fragment>
  );
}
