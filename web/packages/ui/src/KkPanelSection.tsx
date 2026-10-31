import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, Ref } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { KkPanelHeader } from './KkPanelHeader';
import type { KkSx } from './kk-sx';
import type { KkPanelAction } from './panel-action';

interface KkPanelSectionProps extends PropsWithChildren {
  title: string;
  action?: KkPanelAction;
  groupTone?: KkGroupTone;
  titleRef?: Ref<HTMLHeadingElement>;
  landing?: string;
  sx?: KkSx;
}

export const KkPanelSection: FC<KkPanelSectionProps> = ({
  title,
  action,
  groupTone,
  titleRef,
  landing,
  sx,
  children,
}) => (
  <Stack
    data-kk-panel-section
    data-kk-landing={landing}
    sx={[{ gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkPanelHeader title={title} action={action} groupTone={groupTone} titleRef={titleRef} />
    {children}
  </Stack>
);
