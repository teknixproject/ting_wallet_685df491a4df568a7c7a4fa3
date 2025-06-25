'use client';

import { useEffect } from 'react';
import ReactModal from 'react-modal';

import { useHandleData } from '@/hooks/useHandleData';
import { useUpdateData } from '@/hooks/useUpdateData';
import { GridItem } from '@/types/gridItem';

import { RenderSlice } from '../grid-systems';
import { StyleBox } from './StyleBox';

interface ModalProps {
  data: any;
  [key: string]: unknown;
}

const Modal = ({ data, ...props }: ModalProps) => {
  console.log('🚀 ~ Modal ~ data:', data);
  const { dataState } = useHandleData({ dataProp: data?.data });
  console.log('🚀 ~ Modal ~ dataState:', dataState);

  const { updateData } = useUpdateData({ dataProp: data?.data });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const appRoot = document.getElementById('__next');
      if (appRoot) {
        ReactModal.setAppElement(appRoot);
      }
    }
  }, []);

  return (
    <StyleBox
      as={ReactModal}
      isOpen={dataState}
      onRequestClose={updateData}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          position: 'absolute',
          background: 'lightblue',
          padding: '30px',
          borderRadius: '10px',
          margin: 'auto',
          zIndex: 1000,
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
      }}
      styledComponentCss={data?.styledComponentCss}
      {...props}
    >
      {data?.childs?.map((item: GridItem) => (
        <RenderSlice slice={item} key={item.id} />
      ))}
    </StyleBox>
  );
};

export default Modal;
