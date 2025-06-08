// context/LayoutContext.tsx
'use client';
import { createContext, useContext, useState } from 'react';
import { GridItem } from '@/types/gridItem';

interface layoutDataType {
  layoutJson?: GridItem | null;
  _id?: string;
  [key: string]: unknown;
}
interface LayoutContextType {
  headerLayout: layoutDataType;
  footerLayout: layoutDataType;
  setHeaderLayout: (layout: layoutDataType) => void;
  setFooterLayout: (layout: layoutDataType) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerLayout, setHeaderLayout] = useState<layoutDataType>({
    layoutJson: null,
    _id: '',
  });
  const [footerLayout, setFooterLayout] = useState<layoutDataType>({
    layoutJson: null,
    _id: '',
  });

  // Wrapper functions to match the context type
  // const handleSetHeaderLayout = (layout: GridItem | null, _id, ) => {
  //   setHeaderLayout({ layoutJson: layout, _id: '' });
  // };

  // const handleSetFooterLayout = (layout: GridItem | null) => {
  //   setFooterLayout({ layoutJson: layout, _id: '' });
  // };

  return (
    <LayoutContext.Provider
      value={{
        headerLayout,
        footerLayout,
        setHeaderLayout,
        setFooterLayout,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayoutContext must be used within a LayoutProvider');
  return context;
};
