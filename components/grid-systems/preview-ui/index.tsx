import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';
import _ from 'lodash';
import React from 'react';

const SandPackUI = ({ dataPreviewUI }: { dataPreviewUI: any }) => {
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
        },
        environment: 'create-react-app', // Thay đổi từ 'node' sang 'create-react-app'
      }}
      files={{
        '/App.tsx': {
          code: `
            import PreviewComponent from "./PreviewComponent";
            import './tailwind.css';
            
            export default function App() {
              return <PreviewComponent />;
            }
          `,
        },
        '/PreviewComponent.tsx': _.get(dataPreviewUI, 'data.previewData', ''),
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
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor
          style={{ height: '90vh', width: '60%' }}
          showLineNumbers
          showInlineErrors
          closableTabs
        />
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton={true}
          style={{ height: '90vh' }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default SandPackUI;
