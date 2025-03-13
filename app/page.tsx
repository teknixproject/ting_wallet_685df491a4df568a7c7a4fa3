import { Fragment } from 'react';

import ClientWrapper from '@/components/grid-systems/ClientWrapGridSystem';
import Head from 'next/head';
import _ from 'lodash';
import { fetchMetadata } from './actions/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const pageName = 'home';

export default async function Home() {
  const layoutId = pageName;
  const metadata = await fetchMetadata(pageName);
  const formMetadata = _.get(metadata, 'data.form');
  const iconUrl = _.get(formMetadata, 'icon.icon') || '/favicon.ico';

  return (
    <>
      <Head>
        <link rel="icon" href={iconUrl} type="image/png" />
        <link rel="preload" href={iconUrl} as="image" />
        <link
          rel="apple-touch-icon"
          href={_.get(formMetadata, 'icon.apple') || '/apple-icon.png'}
        />
        <link
          rel="shortcut icon"
          href={_.get(formMetadata, 'icon.shortcut') || '/shortcut-icon.png'}
        />
      </Head>
      <Fragment>
        <ClientWrapper layoutId={layoutId} pathName={pageName} />
      </Fragment>
    </>
  );
}
