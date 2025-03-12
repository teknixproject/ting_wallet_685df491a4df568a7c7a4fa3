import { Fragment } from 'react';

import ClientWrapper from '@/components/grid-systems/ClientWrapGridSystem';
import { fetchMetadata } from '../actions/server';
import _ from 'lodash';
import Head from 'next/head';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Params = { uid: string };

export default async function Page({ params }: { params: Params }) {
  const { uid } = await params;
  const metadata = await fetchMetadata(uid);
  const formMetadata = _.get(metadata, 'data.form');
  const iconUrl = _.get(formMetadata, 'icon.icon') || '/favicon.ico';

  try {
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
          <ClientWrapper layoutId={uid} pathName={uid} />
        </Fragment>
      </>
    );
  } catch (error) {
    console.error('Page render error:', error);
    throw new Error('Failed to load page');
  }
}

export async function generateMetadata({ params }: { params: { uid: string } }): Promise<Metadata> {
  const { uid } = await params; // Lấy slug từ URL (ví dụ: "about")
  const metadata = await fetchMetadata(uid);
  const formMetadata = _.get(metadata, 'data.form');

  if (!formMetadata) {
    return {
      title: uid,
      description: uid,
    };
  }
  const iconConfig = {
    icon: _.get(formMetadata, 'icon.icon'),
    shortcut: _.get(formMetadata, 'icon.shortcut'),
    apple: _.get(formMetadata, 'icon.apple'),
  };

  return {
    title: {
      default: formMetadata?.title?.default || 'TBK Foundation',
      template: formMetadata?.title.template,
    },
    description: formMetadata?.description || 'Default description for TBK Foundation.',
    openGraph: {
      title: formMetadata?.openGraph?.title || 'TBK Foundation',
      description:
        formMetadata?.openGraph?.description || 'Default description for TBK Foundation.',
      url: 'https://tbk.foundation/',
      images: formMetadata?.openGraph?.images.map((image: any) => ({
        url: image?.url,
        width: image?.width,
        height: image?.height,
      })),
      locale: formMetadata?.openGraph?.locale || 'en_US',
      type: formMetadata?.openGraph?.type || 'website',
    },
    twitter: {
      card: formMetadata?.twitter?.card,
      images: formMetadata?.twitter?.images,
    },
    robots: {
      index: formMetadata?.robots?.index,
      follow: formMetadata?.robots?.follow,
      nocache: formMetadata?.robots?.nocache,
      googleBot: formMetadata?.robots?.googleBot,
    },
    icons: {
      icon: iconConfig.icon || undefined,
      shortcut: iconConfig.shortcut || undefined,
      apple: iconConfig.apple || undefined,
    },
    alternates: formMetadata?.alternates || {},
  };
}
