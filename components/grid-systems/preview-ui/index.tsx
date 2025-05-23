// components/preview-ui.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import * as Babel from '@babel/standalone';
import { MemoryRouter } from 'react-router-dom';

interface DynamicComponentProps {
  dataPreviewUI: {
    previewData: string; // Chuỗi mã của component
    [key: string]: any;
  };
}

const DynamicComponent: React.FC<DynamicComponentProps> = ({ dataPreviewUI }) => {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    const componentCode = `// Mã JSX từ tool web
import { Button } from './components';
export default function NewComponent() {
  return <div><Button>Click me</Button><p>New Component</p></div>;
}`;

    // Giả lập biên dịch mã JSX (trong thực tế, bạn có thể gửi mã này đến server để xử lý)
    const DynamicComponent = dynamic(() => {
      return eval(Babel.transform(componentCode, { presets: ['react'] }).code);
    });

    setComponent(() => DynamicComponent);
  }, []);

  return (
    <div>
      <h1>Component Preview</h1>
      {Component && <Component />}
    </div>
  );
};

export default DynamicComponent;
