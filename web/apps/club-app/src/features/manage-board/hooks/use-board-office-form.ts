import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateBoardOfficeMutation, useUpdateBoardOfficeMutation } from '../api';
import type { BoardOfficeForm } from '../schemas';
import { BoardOfficeFormSchema } from '../schemas';

const NO_BOARD_OFFICE = 0;

interface BoardOfficeFormInput {
  boardOfficeId: number | null;
  open: boolean;
  initial: BoardOfficeForm;
  onSaved: () => void;
}

export interface BoardOfficeFormControl {
  form: UseFormReturn<BoardOfficeForm>;
  submit: () => void;
  isSaving: boolean;
  rejection: string | null;
}

export const useBoardOfficeForm = ({
  boardOfficeId,
  open,
  initial,
  onSaved,
}: BoardOfficeFormInput): BoardOfficeFormControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const create = useCreateBoardOfficeMutation();
  const update = useUpdateBoardOfficeMutation(boardOfficeId ?? NO_BOARD_OFFICE);

  const form = useForm<BoardOfficeForm>({
    resolver: zodResolver(BoardOfficeFormSchema),
    defaultValues: initial,
  });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(initial);
      setRejection(null);
    }
  }

  const reject = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (boardOfficeId === null) {
      create.mutate(values, { onSuccess: onSaved, onError: reject });

      return;
    }

    update.mutate(values, { onSuccess: onSaved, onError: reject });
  });

  return {
    form,
    submit: () => {
      void handleFormSubmit();
    },
    isSaving: create.isPending || update.isPending,
    rejection,
  };
};
