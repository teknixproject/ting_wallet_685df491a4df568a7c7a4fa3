'use client';

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef } from 'react';

// function extractDependencies(code: string): Record<string, string> {
//   const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
//   const dependencies: Record<string, string> = {};
//   let match;
//   while ((match = importRegex.exec(code)) !== null) {
//     const library = match[1];
//     if (!['react', 'react-dom', 'next'].includes(library)) {
//       dependencies[library] = 'latest';
//     }
//   }
//   return dependencies;
// }

function extractDependencies(code: string): Record<string, string> {
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const dependencies: Record<string, string> = {};
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    let library = match[1];
    // Xử lý các submodule của react-icons
    if (library.startsWith('react-icons/')) {
      library = 'react-icons'; // Chỉ lấy package chính
    }
    // Bỏ qua các thư viện core hoặc đã có trong customSetup
    if (!['react', 'react-dom', 'next'].includes(library)) {
      dependencies[library] = 'latest';
    }
  }
  return dependencies;
}
interface SandPackUIProps {
  dataPreviewUI: any;
}

const SandPackUI = ({ dataPreviewUI }: SandPackUIProps) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const dynamicDependencies = useMemo(() => {
    const code = _.get(dataPreviewUI, 'previewData', '');
    return extractDependencies(code);
  }, [dataPreviewUI]);

  console.log('dynamicDependencies', _.get(dataPreviewUI, 'previewData', ''));

  useEffect(() => {
    const iframe = previewRef.current?.querySelector('iframe');
    if (!iframe) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://expected-origin.com') return; // Thay bằng origin của iframe
      console.log('Message from iframe:', event.data);
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <SandpackProvider
      template="react-ts"
      customSetup={{
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          'react-scripts': '^5.0.1',
          next: '^14.2.0',
          tailwindcss: '^3.4.0',
          postcss: '^8.4.31',
          autoprefixer: '^10.4.16',
          'styled-components': '^5.3.11',
          '@types/styled-components': '^5.1.26',
          'react-icons': '^4.7.1',
          axios: '^1.6.0',
          '@tanstack/react-query': '^4.29.0',
          zustand: '^4.5.0',
          'react-router-dom': '^6.14.0',
          'react-chartjs-2': '^5.2.0',
          'chart.js': '^4.4.0',
          recharts: '^2.12.0',
          'framer-motion': '^10.16.0',
          lodash: '^4.17.21',
          '@types/lodash': '^4.14.197',
          'date-fns': '^2.30.0',
          'react-hook-form': '^7.45.0',
          formik: '^2.4.0',
          yup: '^1.2.0',
          'react-hot-toast': '^2.4.1',
          uuid: '^9.0.0',
          '@types/uuid': '^9.0.2',
          ...dynamicDependencies,
        },
        environment: 'create-react-app',
      }}
      files={{
        '/App.tsx': {
          code: `
          import { BrowserRouter } from 'react-router-dom';
          import PreviewComponent from "./PreviewComponent";
          import './tailwind.css';
          export default function App() {
            return (
              <BrowserRouter>
                <div className="w-full h-[100vh] flex items-center justify-between">
                  <div className="w-full flex items-center justify-center">
                    <PreviewComponent />
                  </div>
                </div>
              </BrowserRouter>
            );
          }
        `,
        },
        '/PreviewComponent.tsx': _.get(dataPreviewUI, 'previewData', ''),
        '/tailwind.css': {
          code: `
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
          `,
        },
        '/package.json': {
          code: JSON.stringify(
            {
              name: 'sandpack-app',
              version: '1.0.0',
              scripts: {
                start: 'react-scripts start',
                build: 'react-scripts build',
                test: 'react-scripts test',
                eject: 'react-scripts eject',
              },
              dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                'react-scripts': '5.0.1',
                lodash: 'latest',
                '@types/lodash': '^4.14.197',
                'react-icons': '^4.7.1',
                tailwindcss: 'latest',
                postcss: 'latest',
                autoprefixer: 'latest',
                'styled-components': '^5.3.11', // Thêm styled-components
                '@types/styled-components': '^5.1.26', // Thêm @types/styled-components nếu dùng TypeScript
              },
              browserslist: {
                production: ['>0.2%', 'not dead', 'not op_mini all'],
                development: [
                  'last 1 chrome version',
                  'last 1 firefox version',
                  'last 1 safari version',
                ],
              },
            },
            null,
            2
          ),
        },
        '/tailwind.config.js': {
          code: `
            module.exports = {
              content: [
                "./src/**/*.{js,jsx,ts,tsx}",
                "./*.js"
              ],
              theme: {
                extend: {},
              },
              plugins: [],
            }
          `,
        },
        '/postcss.config.js': {
          code: `
            module.exports = {
              plugins: {
                tailwindcss: {},
                autoprefixer: {},
              },
            }
          `,
        },
      }}
      options={{
        externalResources: [
          'https://cdn.tailwindcss.com',
          'https://unpkg.com/@tailwindcss/typography@0.5.9/dist/typography.min.css',
        ],
        activeFile: '/App.tsx',
        classes: {
          'sp-wrapper': 'custom-wrapper',
          'sp-layout': 'custom-layout',
          'sp-tab-button': 'custom-tab',
        },
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor
          style={{ height: '90vh' }}
          showLineNumbers
          showInlineErrors
          closableTabs
        />
        <div className="w-full" ref={previewRef}>
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton={true}
            style={{ height: '90vh', backgroundColor: 'pink' }}
          />
        </div>
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default SandPackUI;
