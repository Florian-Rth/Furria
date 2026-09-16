import type { KkLinkSearch, KkSx } from '@furria/ui';
import { KkAvatarStack, KkEyebrow, KkHeading, KkMeta, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';

const DESCRIPTION_LINES = 3;
const PREVIEW_MAX = 3;

interface GroupCardBodyProps {
  name: string;
  count: number;
  unitLabel: string;
  description: string;
  emptyDescription?: string;
  initials?: readonly string[];
  total?: number;
  footNote?: string;
  chips?: ReactNode;
  footer?: ReactNode;
  dimmed?: boolean;
  to: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
  resetScroll?: boolean;
  sx?: KkSx;
}

export const GroupCardBody: FC<GroupCardBodyProps> = ({
  name,
  count,
  unitLabel,
  description,
  emptyDescription,
  initials,
  total,
  footNote,
  chips,
  footer,
  dimmed,
  to,
  params,
  search,
  resetScroll,
  sx,
}) => {
  const text = description.trim();

  const writtenDescription = (
    <KkText variant="body2" tone="secondary" clamp={DESCRIPTION_LINES}>
      {text}
    </KkText>
  );

  const missingDescription =
    emptyDescription === undefined ? null : <KkMeta italic>{emptyDescription}</KkMeta>;

  const descriptionLine = text === '' ? missingDescription : writtenDescription;

  const avatars =
    initials === undefined || initials.length === 0 ? null : (
      <KkAvatarStack initials={initials} max={PREVIEW_MAX} total={total} />
    );

  const stackLabel =
    avatars === null || footNote === undefined ? null : (
      <KkEyebrow tone="muted" size="small">
        {footNote}
      </KkEyebrow>
    );

  const foot =
    avatars === null && footer === undefined ? null : (
      <Stack sx={{ gap: 1, minWidth: 0, mt: 'auto', pt: 1.75 }}>
        {stackLabel}
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
      resetScroll={resetScroll}
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
              {count}
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
