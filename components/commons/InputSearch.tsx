import axios from 'axios';
import { Search } from 'lucide-react';
import React, { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { stateManagementStore } from '@/stores';
import { GridItem } from '@/types/gridItem';
import { useQuery } from '@tanstack/react-query';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent } from '../ui/popover';

type Props = { data: GridItem; style?: CSSProperties; value?: string };

const InputSearch: React.FC<Props> = ({ data, value }) => {
  const { dataState } = useHandleData({ dataProp: data.data });

  const findVariable = stateManagementStore((state) => state.findVariable);
  const updateVariables = stateManagementStore((state) => state.updateVariables);
  const { handleAction } = useActions(data);

  const inputRef = useRef<HTMLInputElement>(null);

  const { type, variableId } = useMemo(() => {
    const type = data.data?.type as 'appState' | 'globalState' | 'componentState';
    const variableId = data.data?.[type]?.variableId ?? '';
    return { type, variableId };
  }, [data.data]);

  const variable = useMemo(() => {
    if (!type || !variableId) return null;
    return findVariable({ id: variableId, type });
  }, [findVariable, type, variableId]);

  const handleInputChange = useDebouncedCallback((value: string) => {
    if (variable && type) {
      updateVariables({
        type,
        dataUpdate: {
          ...variable,
          value,
        },
      });

      handleAction('onChange');
    }
  }, 300);

  const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e.target.value);
  };

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['callApi', dataState],
    queryFn: () => {
      return axios.get(`https://dummyjson.com/users/search?q=${dataState}&select=lastName`);
    },
    enabled: false,
  });
  useEffect(() => {
    refetch();
  }, [dataState, refetch]);
  const setInputSearch = (value: string) => {
    if (inputRef.current) {
      inputRef.current.value = value;
    }
    if (variable && type) {
      updateVariables({
        type,
        dataUpdate: {
          ...variable,
          value,
        },
      });
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center gap-2 relative">
        <Input onChange={handleInputValueChange} defaultValue={dataState} ref={inputRef} />
        <Button
          variant="secondary"
          size="icon"
          className="size-8"
          onClick={() => handleAction('onClick')}
        >
          <Search />
        </Button>
        <PopoverSearch
          dataState={dataState}
          handleAction={() => handleAction('onClick')}
          handleInputValueChange={handleInputValueChange}
          inputSearch={dataState}
          users={users}
          isLoading={isLoading}
          setInputSearch={setInputSearch}
        />
      </div>
    </div>
  );
};
const PopoverSearch: FC<{
  handleAction: () => void;
  handleInputValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputSearch: string;
  users: any;
  isLoading: boolean;
  setInputSearch: (value: string) => void;
  dataState: string;
}> = ({ dataState, users, setInputSearch }) => {
  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    setOpen(!!dataState);
  }, [dataState]);
  const handleClick = (value: string) => {
    setInputSearch(value);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverContent className="w-80 h-80 overflow-auto absolute top-10" asChild>
        <div className="flex flex-col gap-2">
          {users?.data?.users.map((user: any) => (
            <Button key={user.id} onClick={() => handleClick(user.lastName)}>
              {user.lastName}
            </Button>
          ))}
          {!users?.data?.users?.length && <div>No result</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
};
export default InputSearch;
