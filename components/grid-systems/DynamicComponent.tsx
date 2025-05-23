import React, { useEffect, useState } from 'react';

import * as Babel from '@babel/standalone';

interface DynamicComponentProps {
  code: string;
}

const DynamicComponent: React.FC<DynamicComponentProps> = ({ code }) => {
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Wrap the code to handle export default
      const wrappedCode = `
        import React from 'react';
        ${code}
      `;

      // Transpile the JSX/TSX code to JavaScript
      const transpiledCode = Babel.transform(wrappedCode, {
        presets: ['react', 'typescript'],
        plugins: ['transform-modules-commonjs'], // Transform ES modules to CommonJS
        filename: 'component.tsx',
      }).code;

      // Create a function to evaluate the transpiled code
      const exports: any = {};
      const module = { exports };
      const require = (mod: string) => {
        if (mod === 'react') return React;
        throw new Error(`Cannot find module: ${mod}`);
      };

      // Execute the transpiled code
      const func = new Function('exports', 'module', 'require', transpiledCode);
      func(exports, module, require);

      // Get the default export from the module
      if (module.exports && module.exports.default) {
        setComponent(() => module.exports.default);
        setError(null);
      } else {
        setError('No default export found in the component code');
      }
    } catch (err) {
      setError(`Error compiling component: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [code]);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!Component) {
    return <div className="text-gray-500 p-4">Loading component...</div>;
  }

  return <Component />;
};

export default DynamicComponent;
