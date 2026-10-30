import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';

const BADGE = '1.75rem';
const FACT_SEPARATOR = ' · ';

const badgePaint =
  (tone: KkGroupTone | null) =>
  (theme: Theme): CSSObject => ({
    width: BADGE,
    height: BADGE,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    ...(tone === null
      ? { color: 'text.primary', backgroundColor: 'action.hover' }
      : groupToneFieldPaint(theme, tone)),
  });

interface KkAgendaStripProps {
  title: string;
  icon: KkIconName;
  facts: readonly string[];
  tone: KkGroupTone | null;
  showsTitle?: boolean;
}

export const KkAgendaStrip: FC<KkAgendaStripProps> = ({
  title,
  icon,
  facts,
  tone,
  showsTitle = false,
}) => {
  const heading = showsTitle ? (
    <Typography component="h1" variant="h3" sx={{ minWidth: 0 }}>
      {title}
    </Typography>
  ) : (
    <Typography component="h1">
      <KkVisuallyHidden>{title}</KkVisuallyHidden>
    </Typography>
  );

  return (
    <Stack sx={{ gap: 0.25, minWidth: 0 }} data-kk-agenda-strip>
      {heading}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Box aria-hidden sx={badgePaint(tone)}>
          <KkIcon name={icon} size="small" />
        </Box>
        <Typography
          component="p"
          variant="body2"
          sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 0 }}
        >
          {facts.join(FACT_SEPARATOR)}
        </Typography>
      </Stack>
    </Stack>
  );
};
