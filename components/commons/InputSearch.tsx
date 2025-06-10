import axios from 'axios';
import { Search } from 'lucide-react';
import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { useUpdateData } from '@/hooks/useUpdateData';
import { GridItem } from '@/types/gridItem';
import { useQuery } from '@tanstack/react-query';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent } from '../ui/popover';

type Props = {
  data: GridItem;
  style?: CSSProperties;
};

type TForm = {
  inputSearch: string;
};

const InputSearch: React.FC<Props> = ({ data, style }) => {
  const { dataState } = useHandleData({ dataProp: data.data });
  console.log('🚀 ~ dataState:', dataState);
  const inputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<TForm>({
    defaultValues: {
      inputSearch: '',
    },
    values: {
      inputSearch: dataState || '',
    },
  });
  const { control, handleSubmit } = methods;
  const { handleAction } = useActions(data);
  const { updateData } = useUpdateData({ dataProp: data.data });

  const onSubmit = (data: TForm) => {
    console.log('🚀 ~ onSubmit ~ data:', data);
    updateData(data.inputSearch);
    handleAction('onClick');
  };

  return (
    <FormProvider {...methods}>
      <div className="" style={style}>
        <div className="flex justify-center items-center gap-2 relative">
          <Controller
            name="inputSearch"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                ref={(node) => {
                  field.ref(node);
                  inputRef.current = node;
                }}
              />
            )}
          />

          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={handleSubmit(onSubmit)}
          >
            <Search />
          </Button>
          <PopoverSearch inputRef={inputRef} />
        </div>
      </div>
    </FormProvider>
  );
};

const PopoverSearch: FC<{ inputRef: React.RefObject<HTMLInputElement> }> = ({ inputRef }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const { control, setValue } = useFormContext<TForm>();
  const inputSearch = useWatch({ control, name: 'inputSearch' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['callApi', inputSearch],
    queryFn: () => {
      return axios.get(`https://dummyjson.com/users/search?q=${inputSearch}&select=lastName`);
    },
    enabled: false,
  });

  const handle = useDebouncedCallback(() => {
    // Don't open popup if we're in the middle of selecting a value
    if (inputSearch && !isSelecting) {
      setOpen(true);
      refetch();
    } else if (!inputSearch) {
      setOpen(false);
    }
  }, 300);

  useEffect(() => {
    handle();
  }, [inputSearch, handle]);

  const handleClick = (value: string) => {
    setIsSelecting(true);
    setValue('inputSearch', value);
    setOpen(false);

    // Reset the selecting flag after a short delay to allow for normal typing behavior
    setTimeout(() => {
      setIsSelecting(false);
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverContent
        className="w-80 h-80 overflow-auto absolute top-10"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        asChild
      >
        <div className="flex flex-col gap-2">
          {data?.data?.users.map((user: any) => (
            <Button
              key={user.id}
              variant="ghost"
              className="justify-start"
              onClick={() => handleClick(user.lastName)}
            >
              {user.lastName}
            </Button>
          ))}
          {!data?.data?.users?.length && inputSearch && (
            <div className="p-2 text-sm text-muted-foreground">No results found</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InputSearch;
