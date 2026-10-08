import { KkNote } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { useFormContext } from 'react-hook-form';

export const SiteFormSubmitHint: FC<PropsWithChildren> = ({ children }) => {
  const { formState } = useFormContext();

  if (formState.isValid) {
    return null;
  }

  return <KkNote>{children}</KkNote>;
};
