import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

interface KkCalendarDetailSectionProps extends PropsWithChildren {
  icon: KkIconName;
  title: string;
  id?: string;
}

export const KkCalendarDetailSection: FC<KkCalendarDetailSectionProps> = ({
  icon,
  title,
  id,
  children,
}) => (
  <Stack
    component="section"
    id={id}
    data-kk-calendar-detail-section
    sx={(theme) => ({
      gap: 1,
      minWidth: 0,
      pt: 1.5,
      scrollMarginTop: theme.spacing(2),
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: (theme.vars ?? theme).palette.divider,
    })}
  >
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, color: 'text.secondary' }}>
      <KkIcon name={icon} size="small" />
      <Typography component="h3" variant="caption" sx={{ fontWeight: 800, m: 0 }}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Stack>
);
