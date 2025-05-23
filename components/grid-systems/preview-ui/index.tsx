// components/preview-ui.tsx
'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState, useMemo } from 'react';

const Babel = dynamic(() => import('@babel/standalone'), { ssr: false });

interface DynamicComponentProps {
  dataPreviewUI: {
    code: string; // Chuỗi mã của component
    [key: string]: any;
  };
}

const DynamicComponent: React.FC<DynamicComponentProps> = ({ dataPreviewUI }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const match = dataPreviewUI.code.match(/export default (\w+)/);
  const componentName = match ? match[1] : 'App';

  const compiledCode = useMemo(() => {
    if (!dataPreviewUI?.code) {
      setError('No component code provided');
      return null;
    }

    // Kiểm tra cơ bản để đảm bảo mã hợp lệ
    if (!dataPreviewUI.code.includes('export default')) {
      setError('Component code must have a default export');
      return null;
    }

    try {
      const transformedCode = Babel.transform(dataPreviewUI.code, {
        presets: ['react', 'typescript'],
        filename: 'App.tsx',
      }).code;
      return transformedCode;
    } catch (err) {
      setError('Failed to compile component: ' + err.message);
      return null;
    }
  }, [dataPreviewUI?.code]);

  useEffect(() => {
    if (!compiledCode) return;

    try {
      const mod: { exports: any } = { exports: {} };
      const fn = new Function(componentName, compiledCode);
      fn(mod, mod.exports, React);

      const CompiledComponent = mod.exports.default || mod.exports;

      if (!CompiledComponent) {
        setError('No default export found in the component code');
        return;
      }

      setComponent(() => CompiledComponent);
      setError(null);
    } catch (err) {
      console.error('Error executing component:', err);
      setError('Failed to execute component: ' + err.message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledCode]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!Component) {
    return <div>Loading component...</div>;
  }

  return (
    <div className="w-full flex justify-center component-preview-container">
      <Component />
    </div>
  );
};

export default DynamicComponent;
