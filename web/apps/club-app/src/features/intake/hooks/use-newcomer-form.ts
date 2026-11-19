import { apiStatusOf } from '@furria/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toWriteErrorMessage } from '@/lib/write-error';
import { endsLink, toSubmitBody } from '../intake-page';
import type { NewcomerForm } from '../schemas';
import { newcomerFormSchemaFor } from '../schemas';
import type { OpenIntakePage } from './use-intake-page';
import type { PortraitPickControl } from './use-portrait-pick';
import { usePortraitPick } from './use-portrait-pick';
import { usePortraitUpload } from './use-portrait-upload';

const NEWCOMER_DEFAULTS: NewcomerForm = {
  firstName: '',
  lastName: '',
  birthDate: null,
  email: '',
  phone: '',
  street: '',
  zip: '',
  city: '',
  contactVisibleToMembers: false,
};

export interface NewcomerFormControl {
  form: UseFormReturn<NewcomerForm>;
  portrait: PortraitPickControl;
  uploadShare: number | null;
  isSending: boolean;
  canSubmit: boolean;
  rejection: string | null;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useNewcomerForm = ({
  intake,
  submission,
  recheck,
}: OpenIntakePage): NewcomerFormControl => {
  const form = useForm<NewcomerForm>({
    resolver: zodResolver(newcomerFormSchemaFor(intake.addressRequired)),
    defaultValues: NEWCOMER_DEFAULTS,
    mode: 'onTouched',
  });
  const portrait = usePortraitPick();
  const upload = usePortraitUpload({
    token: intake.token,
    shown: portrait.portrait,
    onLinkEnded: recheck,
  });

  const send = async (values: NewcomerForm): Promise<void> => {
    submission.reset();
    const cut = portrait.portrait;
    if (cut !== null && !(await upload.send(cut))) {
      return;
    }
    submission.mutate(toSubmitBody(intake.token, values, intake.addressRequired), {
      onError: (error) => {
        if (endsLink(apiStatusOf(error))) {
          recheck();
        }
      },
    });
  };

  const handleFormSubmit = form.handleSubmit(send);

  return {
    form,
    portrait,
    uploadShare: upload.share,
    isSending: upload.share !== null || submission.isPending,
    canSubmit: !portrait.isCutting,
    rejection: upload.rejection ?? toWriteErrorMessage(submission.error),
    submit: (event) => {
      void handleFormSubmit(event);
    },
  };
};
