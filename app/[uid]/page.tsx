import { Fragment } from 'react';

import ClientWrapper from '@/components/grid-systems/ClientWrapGridSystem';

type Params = { uid: string };

export default async function Page({ params }: { params: Params }) {
  const { uid } = await params;

  try {
    return (
      <Fragment>
        <ClientWrapper layoutId={uid} pathName={uid} />
      </Fragment>
    );
  } catch (error) {
    console.error('Page render error:', error);
    throw new Error('Failed to load page');
  }
}
