'use client';

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';

// import {useData} from "../../../hooks"

const SandPackUI = ({ dataPreviewUI }: { dataPreviewUI: any }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = previewRef.current?.querySelector('iframe');
    if (!iframe) return;

    // const handleLoad = () => {
    //   const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    //   if (!iframeDoc) return;

    //   const style = iframeDoc.createElement('style');
    //   style.innerHTML = `
    //     body {
    //       margin: 0 !important;
    //       padding: 0 !important;
    //       min-height: 100vh !important;
    //       display: flex !important;
    //       justify-content: center !important;
    //       align-items: center !important;
    //     }

    //     /* Nếu muốn căn giữa một container cụ thể */
    //     .your-container {
    //       width: 100%;
    //       max-width: 1200px;
    //       margin: 0 auto;
    //     }
    //   `;

    //   iframeDoc.head.appendChild(style);

    //   const observer = new MutationObserver(() => {
    //     const body = iframeDoc.body;
    //     if (body) {
    //       body.style.display = 'flex';
    //       body.style.justifyContent = 'center';
    //       body.style.alignItems = 'center';
    //     }
    //   });

    //   observer.observe(iframeDoc.documentElement, {
    //     childList: true,
    //     subtree: true,
    //   });

    //   return () => observer.disconnect();
    // };

    // iframe.addEventListener('load', handleLoad);

    // return () => {
    //   iframe.removeEventListener('load', handleLoad);
    // };

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
          lodash: 'latest',
          '@types/lodash': '^4.14.197',
          'react-icons': '^4.7.1',
          tailwindcss: 'latest',
          postcss: 'latest',
          autoprefixer: 'latest',
          'styled-components': '^5.3.11', // Thêm styled-components
          '@types/styled-components': '^5.1.26', // Thêm @types/styled-components nếu dùng TypeScript
        },
        environment: 'create-react-app',
      }}
      files={{
        '/App.tsx': {
          code: `
            import PreviewComponent from "./PreviewComponent";
            import './tailwind.css';
            export default function App() {
              return <div className="w-full h-[100vh] flex items-center justify-between">
               <div className="w-full flex items-center justify-center">
                <PreviewComponent />
               </div>
              </div>;
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
