import { TAction } from './actions';

type TPage = {
  documentId: {
    uid: string;
    documentName: string;
    _id: string;
  };
  roles?: { value: string }[];
  required: boolean;
};

export type TAuthSetting = {
  projectId: string;
  enable: boolean;
  entryPage: string;
  loginPage: string;
  pages: TPage[];
  refreshAction?: TAction; // or use `unknown` for stricter typing
};
