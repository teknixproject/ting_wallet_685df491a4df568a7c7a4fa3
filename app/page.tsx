import _ from 'lodash';
import { Metadata } from 'next';

import EntryPage from '@/components/page/EntryPage';

import { fetchMetadata } from './actions/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  return <EntryPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const path = 'NextJS';

  const metadata = await fetchMetadata(path);
  const formMetadata = _.get(metadata, 'data.form');

  if (!formMetadata) {
    return {
      title: 'NextJS',
      description: 'NextJS 15',
    };
  }
  const iconConfig = {
    icon: _.get(formMetadata, 'icon.icon'),
    shortcut: _.get(formMetadata, 'icon.shortcut'),
    apple: _.get(formMetadata, 'icon.apple'),
  };

  return {
    title: {
      default: formMetadata?.title?.default || 'NextJS PAGE',
      template: formMetadata?.title.template,
    },
    description: formMetadata?.description || 'Default NextJS Page.',
    keywords: formMetadata?.keywords,
    authors: formMetadata?.authors?.map((author: any) => ({
      name: author.name,
      url: author.url,
    })),
    openGraph: {
      title: formMetadata?.openGraph?.title || 'NEXTJS PAGE',
      description: formMetadata?.openGraph?.description || 'Default NextJS page.',
      url: formMetadata?.openGraph?.url,
      siteName: formMetadata?.openGraph?.siteName,
      images: formMetadata?.openGraph?.images?.map((image: any) => ({
        url: image?.url,
        width: image?.width,
        height: image?.height,
        alt: image?.alt,
        secureUrl: image?.secure_url,
        type: image?.type || 'image/jpeg',
      })),
      locale: formMetadata?.openGraph?.locale || 'en_US',
      type: formMetadata?.openGraph?.type || 'website',
      modifiedTime: formMetadata?.openGraph?.updated_time,
    },
    twitter: {
      card: formMetadata?.twitter?.card || 'summary',
      title: formMetadata?.twitter?.title,
      description: formMetadata?.twitter?.description,
      images: formMetadata?.twitter?.images,
    },
    robots: {
      index: formMetadata?.robots?.index,
      follow: formMetadata?.robots?.follow,
      nocache: formMetadata?.robots?.nocache,
      'max-snippet': formMetadata?.robots?.maxSnippet,
      'max-video-preview': formMetadata?.robots?.maxVideoPreview,
      'max-image-preview': formMetadata?.robots?.maxImagePreview,
      googleBot: formMetadata?.robots?.googleBot
        ? {
            index: formMetadata?.robots?.googleBot?.index,
            follow: formMetadata?.robots?.googleBot?.follow,
            noimageindex: formMetadata?.robots?.googleBot?.noimageindex,
          }
        : undefined,
    },
    icons: {
      icon: iconConfig.icon || undefined,
      shortcut: iconConfig.shortcut || undefined,
      apple: iconConfig.apple || undefined,
    },
    alternates: {
      canonical: formMetadata?.alternates?.canonical || undefined,
    },
  };
}
