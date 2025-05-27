'use client'; // Mark as client-only component

import LoadingPage from '../loadingPage';
import dynamic from 'next/dynamic';

interface PreviewUIProps {
  customWidgetName: string | null;
}

const DynamicComponent = ({ customWidgetName }: PreviewUIProps) => {
  // Fallback if customWidgetName is invalid
  if (!customWidgetName || typeof customWidgetName !== 'string') {
    return <div>Invalid widget name</div>;
  }

  // Dynamic import with error handling
  const CustomWidget = dynamic(
    () =>
      import(`@/components/commons/${customWidgetName}`).catch((error) => {
        console.error(`Failed to load component ${customWidgetName}:`, error);
        const ErrorComponent = () => <div>Error loading component</div>;
        ErrorComponent.displayName = 'ErrorComponent';
        return ErrorComponent;
      }),
    {
      loading: () => <LoadingPage />,
      ssr: false, // Disable SSR to avoid hydration issues
    }
  );

  return (
    <div>
      <CustomWidget />
    </div>
  );
};

export default DynamicComponent;
