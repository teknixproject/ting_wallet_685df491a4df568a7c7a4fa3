// context/LayoutContext.tsx
'use client';
import { createContext, useContext, useState } from 'react';
import { GridItem } from '@/types/gridItem';

interface LayoutContextType {
  headerLayout: GridItem | null;
  footerLayout: GridItem | null;
  setHeaderLayout: (layout: GridItem | null) => void;
  setFooterLayout: (layout: GridItem | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerLayout, setHeaderLayout] = useState<GridItem | null>(null);
  const [footerLayout, setFooterLayout] = useState<GridItem | null>(null);

  return (
    <LayoutContext.Provider value={{ headerLayout, footerLayout, setHeaderLayout, setFooterLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayoutContext must be used within a LayoutProvider');
  return context;
};