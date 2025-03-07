import { Fragment } from 'react';

import ClientWrapper from '@/components/grid-systems/ClientWrapGridSystem';

export const dynamic = 'force-static';
export const revalidate = 60;
const pathName = 'home';

export default async function Home() {
  const layoutId = pathName;

  return (
    <Fragment>
      <ClientWrapper layoutId={layoutId} pathName={pathName} />
      <div> test</div>
    </Fragment>
  );
}
