import Stack from '@mui/material/Stack';
import type { FC, FormEvent, PropsWithChildren } from 'react';

interface SiteFormRootProps extends PropsWithChildren {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const SiteFormRoot: FC<SiteFormRootProps> = ({ onSubmit, children }) => (
  <Stack component="form" data-kk-site-form noValidate onSubmit={onSubmit}>
    {children}
  </Stack>
);
