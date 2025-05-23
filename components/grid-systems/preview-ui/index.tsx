// components/preview-ui.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import * as Babel from '@babel/standalone';

interface DynamicComponentProps {
  dataPreviewUI: {
    previewData: string; // Chuỗi mã của component
    [key: string]: any;
  };
}

const DynamicComponent: React.FC<DynamicComponentProps> = ({ dataPreviewUI }) => {
  console.log('dataPreviewUI', dataPreviewUI);

  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract component name from the code
  const match = dataPreviewUI?.previewData.match(/export default (\w+)/);
  const componentName = match ? match[1] : 'App';

  // Memoize the compiled code
  const compiledCode = useMemo(() => {
    if (!dataPreviewUI?.previewData) {
      setError('No component code provided');
      return null;
    }

    if (!dataPreviewUI.previewData.includes('export default')) {
      setError('Component code must have a default export');
      return null;
    }

    try {
      // Transform the code using Babel
      const { code } = Babel.transform(dataPreviewUI.previewData, {
        presets: [['react', { runtime: 'automatic' }], 'typescript'],
        filename: 'App.tsx',
        sourceType: 'module',
        plugins: ['transform-modules-commonjs'],
      });
      console.log('Transformed code:', code); // Debug: Log the transformed code
      return code;
    } catch (err) {
      console.error('Babel transform error:', err);
      setError('Failed to compile component: ' + (err as Error).message);
      return null;
    }
  }, [dataPreviewUI?.previewData]);

  // Execute the compiled code
  useEffect(() => {
    if (!compiledCode) return;
    console.log('compiledCode', compiledCode);

    try {
      // Create a module to hold exports
      const mod: { exports: any } = { exports: {} };
      // Provide a mock require function that returns React
      const require = (module: string) => {
        if (module === 'react') return React;
        throw new Error(`Module ${module} not found`);
      };
      // Evaluate the compiled code
      const fn = new Function(
        'module',
        'exports',
        'React',
        'require',
        compiledCode + '\nreturn module.exports;'
      );

      const exports = fn(mod, mod.exports, React, require);

      const CompiledComponent = exports.default || exports;

      if (!CompiledComponent) {
        setError('No default export found in the component code');
        return;
      }

      setComponent(() => CompiledComponent);
      setError(null);
    } catch (err) {
      console.error('Error executing component:', err);
      setError('Failed to execute component: ' + (err as Error).message);
    }
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
