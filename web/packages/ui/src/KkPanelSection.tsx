import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { KkNote } from './KkNote';
import { KkPanelHeader } from './KkPanelHeader';
import type { KkSx } from './kk-sx';

interface KkPanelSectionProps extends PropsWithChildren {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  description?: string;
  sx?: KkSx;
}

export const KkPanelSection: FC<KkPanelSectionProps> = ({
  title,
  meta,
  action,
  description,
  sx,
  children,
}) => {
  const descriptionLine = description === undefined ? null : <KkNote>{description}</KkNote>;

  return (
    <Stack
      data-kk-panel-section
      sx={[{ gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack sx={{ gap: 0.875, minWidth: 0 }}>
        <KkPanelHeader title={title} meta={meta} action={action} />
        {descriptionLine}
      </Stack>
      {children}
    </Stack>
  );
};
