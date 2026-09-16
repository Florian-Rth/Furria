import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode, Ref } from 'react';
import { KkNote } from './KkNote';
import { KkPanelHeader } from './KkPanelHeader';
import type { KkSx } from './kk-sx';

interface KkPanelSectionProps extends PropsWithChildren {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  description?: string;
  titleRef?: Ref<HTMLHeadingElement>;
  sx?: KkSx;
}

export const KkPanelSection: FC<KkPanelSectionProps> = ({
  title,
  meta,
  action,
  description,
  titleRef,
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
        <KkPanelHeader title={title} meta={meta} action={action} titleRef={titleRef} />
        {descriptionLine}
      </Stack>
      {children}
    </Stack>
  );
};
