import type { KkSx } from '@furria/ui';
import { KkAvatarStack, KkEyebrow, KkHeading, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { toPersonUnitLabel } from '../groups-labels';

const DESCRIPTION_LINES = 3;
const PREVIEW_MAX = 3;

interface GroupCardBodyProps {
  name: string;
  memberCount: number;
  description: string;
  initials?: readonly string[];
  chips?: ReactNode;
  footer?: ReactNode;
  dimmed?: boolean;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string | number>;
  sx?: KkSx;
}

export const GroupCardBody: FC<GroupCardBodyProps> = ({
  name,
  memberCount,
  description,
  initials,
  chips,
  footer,
  dimmed,
  to,
  params,
  search,
  sx,
}) => {
  const text = description.trim();
  const unitLabel = toPersonUnitLabel(memberCount);

  const descriptionLine =
    text === '' ? null : (
      <KkText variant="body2" tone="secondary" clamp={DESCRIPTION_LINES}>
        {text}
      </KkText>
    );

  const avatars =
    initials === undefined || initials.length === 0 ? null : (
      <KkAvatarStack initials={initials} max={PREVIEW_MAX} total={memberCount} />
    );

  const foot =
    avatars === null && footer === undefined ? null : (
      <Stack sx={{ gap: 1, minWidth: 0, mt: 'auto', pt: 1.75 }}>
        {avatars}
        {footer}
      </Stack>
    );

  return (
    <KkPanel
      variant="block"
      dimmed={dimmed}
      component={Link}
      to={to}
      params={params}
      search={search}
      sx={sx}
    >
      <Stack sx={{ gap: 1.25, minWidth: 0, height: '100%' }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5, minWidth: 0 }}>
          <Stack sx={{ gap: 0.875, minWidth: 0, flexGrow: 1, alignItems: 'flex-start' }}>
            <KkHeading level={5} component="h3" sx={{ minWidth: 0 }}>
              {name}
            </KkHeading>
            {chips}
          </Stack>
          <Stack sx={{ alignItems: 'flex-end', gap: 0.25, flexShrink: 0 }}>
            <KkHeading level={4} tone="accent" component="p">
              {memberCount}
            </KkHeading>
            <KkEyebrow tone="muted" size="small">
              {unitLabel}
            </KkEyebrow>
          </Stack>
        </Stack>
        {descriptionLine}
        {foot}
      </Stack>
    </KkPanel>
  );
};
