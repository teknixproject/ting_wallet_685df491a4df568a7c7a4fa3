import Head from 'next/head';
import { headers } from 'next/headers';
import { FC, Suspense } from 'react';

import { fetchMetadata } from '@/app/actions/server';
import { getMatchingRoutePattern } from '@/uitls/pathname';

import { RenderUIClient } from '../grid-systems/ClientWrapGridSystem';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
interface Metadata {
  data?: {
    form?: {
      icon?: {
        icon?: string;
        apple?: string;
        shortcut?: string;
      };
    };
  };
}

const EntryPage: FC = async () => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/route-patterns`;

  const patternsResponse = await fetch(url, {
    cache: 'no-store', // Ensure fresh data
  });
  if (!patternsResponse.ok) {
    console.error('❌ Failed to fetch route patterns:', await patternsResponse.text());
    throw new Error('Failed to fetch route patterns');
  }
  const patterns: string[] = await patternsResponse.json();

  // Get pathname from headers
  const headerList = await headers();
  const pathname = headerList.get('x-path-name') || '/';

  // Find matching pattern
  const matchingPattern = getMatchingRoutePattern(pathname, patterns);

  // Fetch metadata
  const metadata: Metadata = await fetchMetadata(matchingPattern || '');

  // Safely access metadata
  const formMetadata = metadata?.data?.form || {};
  const iconUrl = formMetadata?.icon?.icon || '/favicon.ico';
  const appleIcon = formMetadata?.icon?.apple || '/apple-icon.png';
  const shortcutIcon = formMetadata?.icon?.shortcut || '/shortcut-icon.png';

  return (
    <>
      <Head>
        <link rel="icon" href={iconUrl} type="image/png" />
        <link rel="preload" href={iconUrl} as="image" />
        <link rel="apple-touch-icon" href={appleIcon} />
        <link rel="shortcut icon" href={shortcutIcon} />
      </Head>
      <Suspense fallback={<div>Loading UI...</div>}>
        <RenderUIClient />
      </Suspense>
    </>
  );
};
export default EntryPage;
