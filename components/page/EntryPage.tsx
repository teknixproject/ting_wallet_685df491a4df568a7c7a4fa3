import _ from 'lodash';
import Head from 'next/head';
import { headers } from 'next/headers';
import { FC, Fragment, Suspense } from 'react';

import { fetchMetadata } from '@/app/actions/server';

import { RenderUIClient } from '../grid-systems/ClientWrapGridSystem';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const EntryPage: FC = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-current-path');
  const metadata = await fetchMetadata(pathname || '');
  const formMetadata = _.get(metadata, 'data.form');
  const iconUrl = _.get(formMetadata, 'icon.icon') || '/favicon.ico';

  try {
    return (
      <Suspense>
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
          <RenderUIClient />
        </Fragment>
      </Suspense>
    );
  } catch (error) {
    console.error('EntryPage render error:', error);
    throw new Error('Failed to load page');
  }
};
export default EntryPage;
