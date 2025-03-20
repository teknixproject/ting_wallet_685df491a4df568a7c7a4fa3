export enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
export type TTypeVariable = 'String' | 'Integer' | 'Float' | 'Boolean' | 'Date' | 'Object';
export type TApiCallVariable = {
  key: string;
  value: string;
  type: TTypeVariable;
  isList: boolean;
};

export type TApiCall = {
  projectId: string;
  documentId: string;
  uid: string;
  apis: TApiCallValue[];
};
export type TApiCallValue = {
  apiId: string;
  apiName: string;
  url: string;
  method: METHODS;
  headers: object;
  body: object;
  query: object;
  variables: TApiCallVariable[];
};
